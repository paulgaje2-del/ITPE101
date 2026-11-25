import {transaction,findOrderByIdempotency,createPendingOrder} from '../repositories/order.repository.js';
import {findOrdersByUser} from '../repositories/order.repository.js';
import {findPurchasableProductForUpdate,reserveStock} from '../repositories/product.repository.js';
import {
 findActiveCouponForUpdate,
 incrementCouponUsage,
 countCouponRedemptionsForUser,
 recordCouponRedemption
} from '../repositories/coupon.repository.js';
import {uuidSchema} from '../validators/common.validator.js';
import {httpError} from '../utils/errors.js';

export class OrderService{
 constructor({
  runTransaction=transaction,
  orderRepository={findOrderByIdempotency,createPendingOrder},
  productRepository={findPurchasableProductForUpdate,reserveStock},
  couponRepository={
   findActiveCouponForUpdate,
   incrementCouponUsage,
   countCouponRedemptionsForUser,
   recordCouponRedemption
  }
 }={}){
  this.runTransaction=runTransaction;
  this.orderRepository=orderRepository;
  this.productRepository=productRepository;
  this.couponRepository=couponRepository;
 }

 async create(userId,body,idempotencyKey){
  if(!idempotencyKey)throw httpError('Idempotency-Key header is required.',422,'IDEMPOTENCY_KEY_REQUIRED');
  const existing=await this.orderRepository.findOrderByIdempotency(userId,idempotencyKey);
  if(existing)return existing;
  if(!Array.isArray(body.items)||!body.items.length)throw httpError('Your cart is empty.',422,'CART_EMPTY');

  try{
   return await this.runTransaction(async client=>{
    let subtotal=0;
    const items=[];
    for(const line of body.items){
     if(!uuidSchema.safeParse(String(line.productId||'')).success){
      throw httpError('A selected shoe is unavailable.',409,'PRODUCT_UNAVAILABLE');
     }
     const product=await this.productRepository.findPurchasableProductForUpdate(client,line.productId);
     if(!product)throw httpError('A selected shoe is unavailable.',409,'PRODUCT_UNAVAILABLE');

     const quantity=Number(line.quantity),size=Number(line.size);
     if(!Number.isInteger(quantity)||quantity<1||quantity>5||!product.sizes.includes(size)){
      throw httpError('Invalid shoe quantity or size.',422,'INVALID_SHOE_SELECTION');
     }
     if(!await this.productRepository.reserveStock(client,product.id,quantity)){
      throw httpError(`${product.name} is out of stock.`,409,'INSUFFICIENT_STOCK');
     }

     const unitPrice=Number(product.price);
     subtotal+=unitPrice*quantity;
     items.push({
      product:String(product.id),
      name:product.name,
      image:product.image,
      size,
      color:line.color||product.colors[0],
      quantity,
      unitPrice
     });
    }

    let discount=0,couponCode='';
    if(body.coupon){
     const coupon=await this.couponRepository.findActiveCouponForUpdate(client,body.coupon);
     if(!coupon||
       coupon.expires_at&&coupon.expires_at<new Date()||
       coupon.used_count>=coupon.usage_limit||
       subtotal<Number(coupon.min_spend)){
      throw httpError('Coupon is invalid, expired, or not eligible.',422,'COUPON_INVALID');
     }
     const customerRedemptions=await this.couponRepository.countCouponRedemptionsForUser(
      client,
      coupon.code,
      userId
     );
     if(customerRedemptions>=Number(coupon.per_customer_limit)){
      throw httpError('You have reached the redemption limit for this coupon.',422,'COUPON_LIMIT_REACHED');
     }
     discount=coupon.type==='percent'?subtotal*Number(coupon.value)/100:Number(coupon.value);
     discount=Math.min(discount,subtotal);
     couponCode=coupon.code;
    }

    const shippingFee=subtotal-discount>=2500?0:120;
    const total=Number((subtotal-discount+shippingFee).toFixed(2));
    const order=await this.orderRepository.createPendingOrder(client,{
     userId,
     items,
     shipping:body.shipping||{},
     subtotal,
     discount,
     shippingFee,
     total,
     couponCode,
     idempotencyKey
    });
    if(couponCode){
     await this.couponRepository.incrementCouponUsage(client,couponCode);
     await this.couponRepository.recordCouponRedemption(client,{
      code:couponCode,
      userId,
      orderId:order._id
     });
    }
    return order;
   });
  }catch(error){
   if(error.code==='23505'){
    const duplicate=await this.orderRepository.findOrderByIdempotency(userId,idempotencyKey);
    if(duplicate)return duplicate;
   }
   throw error;
  }
 }
}

export const orderService=new OrderService();

export async function createOrder(userId,body,key){
 return orderService.create(userId,body,key);
}

export function listCustomerOrders(userId){
 return findOrdersByUser(userId);
}

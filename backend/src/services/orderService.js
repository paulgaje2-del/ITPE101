import {transaction,findOrderByIdempotency} from '../models/index.js';

const fail=(message,status,code)=>Object.assign(new Error(message),{status,code});
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const orderColumns=`id AS "_id",user_id AS "user",items,shipping,subtotal,discount,shipping_fee AS "shippingFee",total,coupon_code AS "couponCode",status,payment_reference AS "paymentReference",payment_url AS "paymentUrl",idempotency_key AS "idempotencyKey",payment_mismatch AS "paymentMismatch",status_history AS "statusHistory",created_at AS "createdAt",updated_at AS "updatedAt"`;

export async function createOrder(userId,body,key){
 if(!key)throw fail('Idempotency-Key header is required.',422);
 const existing=await findOrderByIdempotency(userId,key);
 if(existing)return existing;
 if(!Array.isArray(body.items)||!body.items.length)throw fail('Your cart is empty.',422);

 try{
  return await transaction(async client=>{
   let subtotal=0;
   const items=[];
   for(const line of body.items){
    const productId=String(line.productId||'');
    if(!uuidPattern.test(productId))throw fail('A selected shoe is unavailable.',409);
    const selected=await client.query('SELECT * FROM products WHERE id=$1 AND active=true FOR UPDATE',[productId]);
    const product=selected.rows[0];
    if(!product)throw fail('A selected shoe is unavailable.',409);
    const quantity=Number(line.quantity),size=Number(line.size);
    if(!Number.isInteger(quantity)||quantity<1||quantity>5||!product.sizes.includes(size))throw fail('Invalid shoe quantity or size.',422);
    const updated=await client.query('UPDATE products SET stock=stock-$2,updated_at=now() WHERE id=$1 AND stock >= $2',[product.id,quantity]);
    if(!updated.rowCount)throw fail(`${product.name} is out of stock.`,409);
    const unitPrice=Number(product.price);
    subtotal+=unitPrice*quantity;
    items.push({product:String(product.id),name:product.name,image:product.image,size,color:line.color||product.colors[0],quantity,unitPrice});
   }

   let discount=0,couponCode='';
   if(body.coupon){
    const result=await client.query('SELECT * FROM coupons WHERE code=upper($1) AND active=true FOR UPDATE',[String(body.coupon)]);
    const coupon=result.rows[0];
    if(!coupon||coupon.expires_at&&coupon.expires_at<new Date()||coupon.used_count>=coupon.usage_limit||subtotal<Number(coupon.min_spend))throw fail('Coupon is invalid, expired, or not eligible.',422,'COUPON_INVALID');
    discount=coupon.type==='percent'?subtotal*Number(coupon.value)/100:Number(coupon.value);
    discount=Math.min(discount,subtotal);
    couponCode=coupon.code;
    await client.query('UPDATE coupons SET used_count=used_count+1 WHERE code=$1',[coupon.code]);
   }

   const shippingFee=subtotal-discount>=2500?0:120;
   const total=Number((subtotal-discount+shippingFee).toFixed(2));
   const result=await client.query(`INSERT INTO orders(user_id,items,shipping,subtotal,discount,shipping_fee,total,coupon_code,idempotency_key,status_history)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING ${orderColumns}`,
   [userId,JSON.stringify(items),JSON.stringify(body.shipping||{}),subtotal,discount,shippingFee,total,couponCode||null,key,JSON.stringify([{status:'pending_payment',actor:String(userId),at:new Date().toISOString()}])]);
   return result.rows[0];
  });
 }catch(error){
  if(error.code==='23505'){
   const duplicate=await findOrderByIdempotency(userId,key);
   if(duplicate)return duplicate;
  }
  throw error;
 }
}

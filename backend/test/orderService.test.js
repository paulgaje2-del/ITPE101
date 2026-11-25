import test from 'node:test';
import assert from 'node:assert/strict';
import {OrderService} from '../src/services/orderService.js';

const userId='3eb0b6df-46aa-4ba2-9672-53a9b5b2438e';
const productId='0d9c99d6-f839-4462-9dcf-f411d84e7375';
const orderId='671791b9-fcb2-4c93-8a46-53a3eec75919';

function createService({redemptions=0}={}){
 const calls=[];
 const service=new OrderService({
  runTransaction:work=>work({}),
  orderRepository:{
   findOrderByIdempotency:async()=>null,
   createPendingOrder:async(client,order)=>{
    calls.push(['create-order',order]);
    return {_id:orderId,...order};
   }
  },
  productRepository:{
   findPurchasableProductForUpdate:async()=>({
    id:productId,
    name:'Test Runner',
    image:'https://example.com/runner.jpg',
    price:'1000.00',
    sizes:[8,9],
    colors:['Black']
   }),
   reserveStock:async()=>true
  },
  couponRepository:{
   findActiveCouponForUpdate:async()=>({
    code:'WELCOME10',
    type:'percent',
    value:'10',
    min_spend:'0',
    expires_at:null,
    used_count:0,
    usage_limit:20,
    per_customer_limit:1
   }),
   countCouponRedemptionsForUser:async()=>redemptions,
   incrementCouponUsage:async(client,code)=>calls.push(['increment',code]),
   recordCouponRedemption:async(client,redemption)=>calls.push(['redemption',redemption])
  }
 });
 return {service,calls};
}

const checkoutBody={
 items:[{productId,size:9,quantity:1}],
 coupon:'WELCOME10',
 shipping:{name:'Test Customer'}
};

test('checkout rejects a coupon after the customer redemption limit',async()=>{
 const {service,calls}=createService({redemptions:1});

 await assert.rejects(
  service.create(userId,checkoutBody,'checkout-key-limit'),
  error=>error.code==='COUPON_LIMIT_REACHED'
 );
 assert.equal(calls.some(([type])=>type==='create-order'),false);
 assert.equal(calls.some(([type])=>type==='increment'),false);
});

test('checkout records an allowed coupon redemption with its order',async()=>{
 const {service,calls}=createService();

 const order=await service.create(userId,checkoutBody,'checkout-key-allowed');

 assert.equal(order._id,orderId);
 assert.equal(calls[0][0],'create-order');
 assert.equal(calls[0][1].couponCode,'WELCOME10');
 assert.equal(calls[0][1].discount,100);
 assert.equal(calls[0][1].total,1020);
 assert.deepEqual(calls.slice(1),[
  ['increment','WELCOME10'],
  ['redemption',{code:'WELCOME10',userId,orderId}]
 ]);
});

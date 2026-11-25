import test from 'node:test';
import assert from 'node:assert/strict';
import {PaymentProvider,PayMongoProvider,MayaProvider,PaymentProviderFactory} from '../src/patterns/payment/payment-provider.js';

test('base payment provider rejects an unimplemented checkout operation',async()=>{await assert.rejects(()=>new PaymentProvider().createCheckout(),/must be implemented/)});
test('base payment provider rejects an unimplemented verification operation',async()=>{await assert.rejects(()=>new PaymentProvider().verifyPayment(),/must be implemented/)});
test('base payment provider rejects an unimplemented webhook operation',()=>{assert.throws(()=>new PaymentProvider().verifyWebhook(),/must be implemented/)});
test('factory creates Maya adapter by default',()=>{delete process.env.PAYMENT_PROVIDER;assert.ok(PaymentProviderFactory.create() instanceof MayaProvider)});
test('factory creates PayMongo adapter when selected',()=>{assert.ok(PaymentProviderFactory.create('paymongo') instanceof PayMongoProvider)});
test('factory creates Maya adapter when selected',()=>{assert.ok(PaymentProviderFactory.create('maya') instanceof MayaProvider)});
test('factory rejects unknown providers',()=>{assert.throws(()=>PaymentProviderFactory.create('unknown'),/Unsupported payment provider/)});
test('Maya checkout requires sandbox keys',async()=>{delete process.env.MAYA_PUBLIC_KEY;delete process.env.MAYA_SECRET_KEY;await assert.rejects(()=>new MayaProvider().createCheckout({_id:'1',shipping:{},user:{},items:[],subtotal:0,shippingFee:0,total:0}),/keys are not configured/)});
test('Maya checkout sends the documented money object shape',async()=>{
 const previous={
  publicKey:process.env.MAYA_PUBLIC_KEY,
  secretKey:process.env.MAYA_SECRET_KEY,
  environment:process.env.MAYA_ENVIRONMENT,
  clientUrl:process.env.CLIENT_URL,
  fetch:globalThis.fetch
 };
 let request;
 try{
  process.env.MAYA_PUBLIC_KEY='pk-test';
  process.env.MAYA_SECRET_KEY='sk-test';
  process.env.MAYA_ENVIRONMENT='sandbox';
  process.env.CLIENT_URL='https://soleva.example';
  globalThis.fetch=async(url,options)=>{
   request={url,options};
   return {ok:true,json:async()=>({checkoutId:'maya-session',redirectUrl:'https://maya.example/checkout'})};
  };
  const result=await new MayaProvider().createCheckout({
   _id:'order-123',
   shipping:{name:'Juan Dela Cruz',phone:'09171234567'},
   user:{email:'juan@example.com'},
   items:[{name:'Court Vision',product:'shoe-123',size:42,quantity:2,unitPrice:1500}],
   subtotal:3000,
   shippingFee:0,
   discount:100,
   total:2900
  });
  const body=JSON.parse(request.options.body);
  assert.equal(request.url,'https://pg-sandbox.paymaya.com/checkout/v1/checkouts');
  assert.equal(request.options.method,'POST');
  assert.equal(request.options.headers.Authorization,`Basic ${Buffer.from('pk-test:').toString('base64')}`);
  assert.deepEqual(body.totalAmount,{
   value:2900,
   currency:'PHP',
   details:{subtotal:3000,shippingFee:0,tax:0,discount:100,serviceCharge:0}
  });
  assert.deepEqual(body.items,[{
   name:'Court Vision',
   quantity:2,
   code:'shoe-123',
   description:'SOLEVA size 42',
   amount:{value:1500},
   totalAmount:{value:3000}
  }]);
  assert.deepEqual(result,{id:'maya-session',url:'https://maya.example/checkout'});
 }finally{
  for(const [key,value] of [
   ['MAYA_PUBLIC_KEY',previous.publicKey],
   ['MAYA_SECRET_KEY',previous.secretKey],
   ['MAYA_ENVIRONMENT',previous.environment],
   ['CLIENT_URL',previous.clientUrl]
  ]){
   if(value===undefined)delete process.env[key];
   else process.env[key]=value;
  }
  globalThis.fetch=previous.fetch;
 }
});
test('Maya payment verification uses the secret key and reads the returned money value',async()=>{
 const previous={
  publicKey:process.env.MAYA_PUBLIC_KEY,
  secretKey:process.env.MAYA_SECRET_KEY,
  environment:process.env.MAYA_ENVIRONMENT,
  fetch:globalThis.fetch
 };
 let request;
 try{
  process.env.MAYA_PUBLIC_KEY='pk-test';
  process.env.MAYA_SECRET_KEY='sk-test';
  process.env.MAYA_ENVIRONMENT='sandbox';
  globalThis.fetch=async(url,options)=>{
   request={url,options};
   return {
    ok:true,
    json:async()=>({
     paymentStatus:'PAYMENT_SUCCESS',
     paymentDetails:{responses:{efs:{amount:{total:{value:2900,currency:'PHP'}}}}}
    })
   };
  };
  const result=await new MayaProvider().verifyPayment('maya-session');
  assert.equal(request.url,'https://pg-sandbox.paymaya.com/checkout/v1/checkouts/maya-session');
  assert.equal(request.options.headers.Authorization,`Basic ${Buffer.from('sk-test:').toString('base64')}`);
  assert.deepEqual(result,{paid:true,amount:290000,currency:'PHP'});
 }finally{
  for(const [key,value] of [
   ['MAYA_PUBLIC_KEY',previous.publicKey],
   ['MAYA_SECRET_KEY',previous.secretKey],
   ['MAYA_ENVIRONMENT',previous.environment]
  ]){
   if(value===undefined)delete process.env[key];
   else process.env[key]=value;
  }
  globalThis.fetch=previous.fetch;
 }
});

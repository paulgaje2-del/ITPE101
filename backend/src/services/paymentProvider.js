import crypto from 'node:crypto';

// Factory + inheritance: callers depend on PaymentProvider, not gateway-specific HTTP details.
export class PaymentProvider {
 async createCheckout(){throw new Error('createCheckout must be implemented');}
 async verifyPayment(){throw new Error('verifyPayment must be implemented');}
 verifyWebhook(){throw new Error('verifyWebhook must be implemented');}
}
export class PayMongoProvider extends PaymentProvider {
 async createCheckout(order){
  if(!process.env.PAYMONGO_SECRET_KEY) throw Object.assign(new Error('PayMongo test key is not configured'),{status:503});
  const auth=Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
  const body={data:{attributes:{billing:{name:order.shipping.name,email:order.user.email,phone:order.shipping.phone},line_items:[{currency:'PHP',amount:Math.round(order.total*100),name:`SOLEVA order ${order._id}`,quantity:1}],payment_method_types:['card','gcash','paymaya'],description:`SOLEVA order ${order._id}`,success_url:`${process.env.CLIENT_URL}/orders?payment=return`,cancel_url:`${process.env.CLIENT_URL}/cart?payment=cancelled`,reference_number:String(order._id)}}};
  const res=await fetch('https://api.paymongo.com/v1/checkout_sessions',{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await res.json(); if(!res.ok) throw Object.assign(new Error(data.errors?.[0]?.detail||'Payment provider error'),{status:502});
  return {id:data.data.id,url:data.data.attributes.checkout_url};
 }
 async verifyPayment(reference){
  if(!reference) return false;
  const auth=Buffer.from(`${process.env.PAYMONGO_SECRET_KEY}:`).toString('base64');
  const res=await fetch(`https://api.paymongo.com/v1/checkout_sessions/${reference}`,{headers:{Authorization:`Basic ${auth}`}});
  if(!res.ok)return false; const d=await res.json(); const a=d.data?.attributes;
  return {paid:a?.payment_intent?.attributes?.status==='succeeded',amount:a?.line_items?.reduce((s,x)=>s+x.amount*x.quantity,0),currency:'PHP'};
 }
}
export class MayaProvider extends PaymentProvider {
 getBaseUrl(){return process.env.MAYA_ENVIRONMENT==='production'
  ? 'https://pg.paymaya.com'
  : 'https://pg-sandbox.paymaya.com';}
 async createCheckout(order){
  const publicKey=process.env.MAYA_PUBLIC_KEY;
  const secretKey=process.env.MAYA_SECRET_KEY;
  if(!publicKey||!secretKey) throw Object.assign(new Error('Maya sandbox keys are not configured'),{status:503});
  const auth=Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
  const buyerName=order.shipping?.name||order.user?.name||'SOLEVA Customer';
  const nameParts=buyerName.trim().split(/\s+/);
  const amount=Number(order.total).toFixed(2);
  const body={
   totalAmount:{amount,currency:'PHP',details:{subtotal:Number(order.subtotal).toFixed(2),shippingFee:Number(order.shippingFee||0).toFixed(2),tax:'0.00',discount:Number(order.discount||0).toFixed(2)}},
   buyer:{firstName:nameParts[0]||'SOLEVA',lastName:nameParts.slice(1).join(' ')||'Customer',contact:{phone:order.shipping?.phone||'09170000000',email:order.user?.email||'customer@soleva.test'}},
   items:(order.items||[]).map(item=>({name:item.name,quantity:String(item.quantity),code:String(item.product),description:`SOLEVA size ${item.size}`,amount:Number(item.unitPrice).toFixed(2),totalAmount:Number(item.unitPrice*item.quantity).toFixed(2)})),
   redirectUrl:{success:`${process.env.CLIENT_URL}/orders?payment=success`,failure:`${process.env.CLIENT_URL}/cart?payment=failed`,cancel:`${process.env.CLIENT_URL}/cart?payment=cancelled`},
   requestReferenceNumber:String(order._id)
  };
  const res=await fetch(`${this.getBaseUrl()}/checkout/v1/checkouts`,{method:'POST',headers:{Authorization:`Basic ${auth}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
  const data=await res.json();
  if(!res.ok) throw Object.assign(new Error(data.message||data.error||'Maya payment provider error'),{status:502});
  return {id:data.checkoutId,url:data.redirectUrl||data.redirectUrl?.url};
 }
 async verifyPayment(reference){
  const publicKey=process.env.MAYA_PUBLIC_KEY;
  const secretKey=process.env.MAYA_SECRET_KEY;
  if(!reference||!publicKey||!secretKey)return false;
  const auth=Buffer.from(`${publicKey}:${secretKey}`).toString('base64');
  const res=await fetch(`${this.getBaseUrl()}/checkout/v1/checkouts/${reference}`,{headers:{Authorization:`Basic ${auth}`}});
  if(!res.ok)return false;
  const data=await res.json();
  const paymentStatus=data.paymentStatus||data.status||data.checkoutStatus;
  const amount=Number(data.totalAmount?.amount ?? data.amount ?? 0);
  return {paid:String(paymentStatus).toUpperCase()==='PAYMENT_SUCCESS'||String(paymentStatus).toUpperCase()==='COMPLETED',amount:Math.round(amount*100),currency:String(data.totalAmount?.currency||data.currency||'PHP').toUpperCase()};
 }
 verifyWebhook(rawBody,signature){
  const secret=process.env.MAYA_WEBHOOK_SECRET;
  if(!secret||!signature)return false;
  const supplied=String(signature).trim();
  const expected=crypto.createHmac('sha256',secret).update(rawBody).digest('hex');
  const a=Buffer.from(expected,'utf8');
  const b=Buffer.from(supplied.replace(/^sha256=/i,''),'utf8');
  return a.length===b.length&&crypto.timingSafeEqual(a,b);
 }
}
export class PaymentProviderFactory {
 static create(name=process.env.PAYMENT_PROVIDER||'maya'){
  if(name==='maya')return new MayaProvider();
  if(name==='paymongo')return new PayMongoProvider();
  throw new Error('Unsupported payment provider');
 }
}

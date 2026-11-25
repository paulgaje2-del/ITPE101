import crypto from 'node:crypto';
import {PaymentProviderFactory} from '../patterns/payment/payment-provider.js';
import {httpError} from '../utils/errors.js';

export class PaymentService{
 constructor(provider=PaymentProviderFactory.create()){
  this.provider=provider;
 }

 createCheckout(order,user){
  return this.provider.createCheckout({...order,user});
 }

 verifyPayment(reference){
  return this.provider.verifyPayment(reference);
 }

 verifyWebhook(rawBody,headers){
  if(process.env.PAYMENT_PROVIDER==='paymongo'){
   const signature=headers['paymongo-signature'];
   const secret=process.env.PAYMONGO_WEBHOOK_SECRET;
   if(!secret||!signature)return false;
   const parts=Object.fromEntries(signature.split(',').map(part=>part.split('=')));
   const timestamp=parts.t||'';
   const supplied=parts.te||parts.li||'';
   const expected=crypto.createHmac('sha256',secret).update(`${timestamp}.${rawBody}`).digest('hex');
   const expectedBytes=Buffer.from(expected);
   const suppliedBytes=Buffer.from(supplied);
   return !!timestamp&&!!supplied&&
    expectedBytes.length===suppliedBytes.length&&
    crypto.timingSafeEqual(expectedBytes,suppliedBytes);
  }
  const signature=headers['x-maya-signature']||headers['x-paymaya-signature'];
  return this.provider.verifyWebhook(rawBody,signature);
 }

 assertPaymentProviderConfigured(){
  const selected=process.env.PAYMENT_PROVIDER||'maya';
  const hasKeys=selected==='paymongo'
   ?Boolean(process.env.PAYMONGO_SECRET_KEY)
   :Boolean(process.env.MAYA_PUBLIC_KEY&&process.env.MAYA_SECRET_KEY);
  if(!hasKeys)throw httpError('Payment provider test keys are not configured.',503,'PAYMENT_PROVIDER_UNAVAILABLE');
 }
}

export const paymentService=new PaymentService();

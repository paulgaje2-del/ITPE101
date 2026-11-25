import {
 findOrderById,
 transitionOrderStatus,
 recordPaymentMismatch
} from '../repositories/order.repository.js';
import {
 insertWebhookEvent,
 markWebhookProcessed
} from '../repositories/webhook-event.repository.js';
import {paymentService} from './payment.service.js';
import {httpError} from '../utils/errors.js';

export class WebhookService{
 constructor({payments=paymentService,orders={
  findOrderById,
  transitionOrderStatus,
  recordPaymentMismatch
 },events={insertWebhookEvent,markWebhookProcessed}}={}){
  this.payments=payments;
  this.orders=orders;
  this.events=events;
 }

 async process({rawBody,event,headers}){
  if(!this.payments.verifyWebhook(rawBody,headers)){
   throw httpError('Invalid payment webhook signature.',401,'INVALID_WEBHOOK_SIGNATURE');
  }

  let payload=event;
  if(process.env.PAYMENT_PROVIDER==='paymongo')payload=event?.data;
  const eventId=String(payload?.id||payload?.checkoutId||payload?.requestReferenceNumber||'');
  if(!eventId)throw httpError('Webhook event ID is required.',422,'WEBHOOK_EVENT_ID_REQUIRED');
  const type=String(payload?.eventType||payload?.paymentStatus||payload?.status||payload?.attributes?.type||'unknown');
  if(!await this.events.insertWebhookEvent(eventId,type))return {duplicate:true};

  const reference=payload?.requestReferenceNumber||
   payload?.attributes?.data?.attributes?.reference_number||
   payload?.referenceNumber;
  const order=reference?await this.orders.findOrderById(reference):null;
  if(order&&/paid|success|completed/i.test(type)){
   const verification=await this.payments.verifyPayment(order.paymentReference);
   const expectedAmount=Math.round(Number(order.total)*100);
   if(verification?.paid&&expectedAmount===Number(verification.amount)&&verification.currency==='PHP'){
    if(order.status==='pending_payment'){
     await this.orders.transitionOrderStatus(order._id,'pending_payment','paid',`${process.env.PAYMENT_PROVIDER||'maya'}-webhook`);
    }
   }else if(verification){
    await this.orders.recordPaymentMismatch(order._id,{
     amount:verification.amount,
     currency:verification.currency,
     orderAmount:expectedAmount,
     orderCurrency:'PHP'
    });
   }
  }
  await this.events.markWebhookProcessed(eventId);
  return {duplicate:false};
 }
}

export const webhookService=new WebhookService();

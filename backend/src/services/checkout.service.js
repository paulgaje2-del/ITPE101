import {findUserById} from '../repositories/user.repository.js';
import {updatePaymentSession} from '../repositories/order.repository.js';
import {orderService} from './orderService.js';
import {paymentService} from './payment.service.js';
import {httpError} from '../utils/errors.js';

export class CheckoutService{
 constructor({
  orders=orderService,
  payments=paymentService,
  users={findUserById},
  orderRepository={updatePaymentSession}
 }={}){
  this.orders=orders;
  this.payments=payments;
  this.users=users;
  this.orderRepository=orderRepository;
 }

 async checkout(userId,body,idempotencyKey){
  const order=await this.orders.create(userId,body,idempotencyKey);
  if(order.paymentUrl&&order.paymentReference){
   return {order,paymentUrl:order.paymentUrl};
  }
  const user=await this.users.findUserById(userId);
  if(!user)throw httpError('Customer account was not found.',404,'USER_NOT_FOUND');
  this.payments.assertPaymentProviderConfigured();
  const session=await this.payments.createCheckout(order,user);
  const updated=await this.orderRepository.updatePaymentSession(order._id,session.id,session.url);
  if(!updated)throw httpError('The order was created but its payment session could not be saved.',500,'PAYMENT_SESSION_SAVE_FAILED');
  return {order:updated,paymentUrl:session.url};
 }
}

export const checkoutService=new CheckoutService();

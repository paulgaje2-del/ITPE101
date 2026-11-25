import {listCustomerOrders} from '../services/orderService.js';
import {checkoutService} from '../services/checkout.service.js';
import {sendSuccess} from '../utils/http.js';

export async function checkout(req,res){
 const result=await checkoutService.checkout(
  req.user.id,
  req.validated.body,
  req.validated.headers['idempotency-key']
 );
 sendSuccess(res,result,201);
}

export async function listMyOrders(req,res){
 sendSuccess(res,await listCustomerOrders(req.user.id));
}

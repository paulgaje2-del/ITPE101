import {Router} from 'express';
import express from 'express';
import {receivePaymentWebhook} from '../controllers/webhook.controller.js';
import {asyncHandler} from '../utils/async.js';
import {httpError} from '../utils/errors.js';

const router=Router();
router.post('/payments/webhook',express.raw({type:'application/json',limit:'20kb'}),(req,res,next)=>{
 req.rawBody=req.body;
 try{
  req.body=JSON.parse(req.rawBody.toString());
  return next();
 }catch{
  return next(httpError('Webhook body must contain valid JSON.',400,'INVALID_JSON'));
 }
},asyncHandler(receivePaymentWebhook));

export default router;

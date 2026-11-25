import {webhookService} from '../services/webhook.service.js';

export async function receivePaymentWebhook(req,res){
 await webhookService.process({
  rawBody:req.rawBody,
  event:req.body,
  headers:req.headers
 });
 return res.sendStatus(200);
}

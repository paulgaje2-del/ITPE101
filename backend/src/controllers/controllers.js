import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import {
 createUser,createProduct as insertProduct,createCoupon as insertCoupon,deactivateProduct,dashboardSummary,
 findOrderById,findOrdersByUser,findAllOrders,findProduct,findProductsByIds,
 findUserByEmail,findUserById,insertWebhookEvent,listProducts,markWebhookProcessed,
 recordPaymentMismatch,updateOrderStatus,updatePaymentSession,updateProduct as updateProductRecord
} from '../models/index.js';
import {createOrder} from '../services/orderService.js';
import {PaymentProviderFactory} from '../patterns/payment/payment-provider.js';
import {ShoeDiscoveryService} from '../services/aiService.js';

const ok=(res,data,status=200,meta)=>res.status(status).json({success:true,data,...(meta?{meta}:{})});
const userData=user=>({id:user.id,name:user.name,email:user.email,role:user.role});

export const register=async(req,res)=>{
 const {name,email,password}=req.body;
 if(!name||!email||!password||password.length<8)return res.status(422).json({success:false,error:{code:'VALIDATION_ERROR',message:'Name, valid email and password (8+ characters) are required.'}});
 if(await findUserByEmail(email))return res.status(409).json({success:false,error:{code:'EMAIL_EXISTS',message:'An account with this email already exists.'}});
 const user=await createUser({name,email,password:await bcrypt.hash(password,12)});
 const token=jwt.sign({id:user.id,role:user.role,name:user.name},process.env.JWT_SECRET,{expiresIn:'2h'});
 ok(res,{token,user:userData(user)},201);
};

export const login=async(req,res)=>{
 const user=await findUserByEmail(req.body.email||'',true);
 if(!user||!await bcrypt.compare(req.body.password||'',user.password))return res.status(401).json({success:false,error:{code:'INVALID_CREDENTIALS',message:'Email or password is incorrect.'}});
 const token=jwt.sign({id:user.id,role:user.role,name:user.name},process.env.JWT_SECRET,{expiresIn:'2h'});
 ok(res,{token,user:userData(user)});
};

export const products=async(req,res)=>{
 const requestedPage=Number(req.query.page||1),requestedLimit=Number(req.query.limit||12);
 const page=Number.isFinite(requestedPage)?Math.max(1,requestedPage):1;
 const limit=Number.isFinite(requestedLimit)?Math.min(48,Math.max(1,requestedLimit)):12;
 const {data,total}=await listProducts({q:req.query.q,category:req.query.category,sort:req.query.sort,page,limit});
 ok(res,data,200,{total,page,limit});
};

export const productDetail=async(req,res)=>{
 const product=await findProduct(req.params.id,{activeOnly:true});
 if(!product)return res.status(404).json({success:false,error:{code:'PRODUCT_NOT_FOUND',message:'Shoe not found.'}});
 ok(res,product);
};

export const createProduct=async(req,res)=>ok(res,await insertProduct(req.body),201);

export const updateProduct=async(req,res)=>{
 const product=await updateProductRecord(req.params.id,req.body);
 if(!product)return res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Shoe not found.'}});
 ok(res,product);
};

export const deleteProduct=async(req,res)=>{
 const product=await deactivateProduct(req.params.id);
 if(!product)return res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Shoe not found.'}});
 ok(res,product);
};

export const checkout=async(req,res)=>{
 const order=await createOrder(req.user.id,req.body,req.headers['idempotency-key']);
 const provider=PaymentProviderFactory.create();
 const user=await findUserById(req.user.id);
 const session=await provider.createCheckout({...order,user});
 const updated=await updatePaymentSession(order._id,session.id,session.url);
 ok(res,{order:updated,paymentUrl:session.url},201);
};

export const myOrders=async(req,res)=>ok(res,await findOrdersByUser(req.user.id));
export const adminOrders=async(req,res)=>ok(res,await findAllOrders());

export const updateOrder=async(req,res)=>{
 const allowed={paid:['processing'],processing:['shipped'],shipped:['delivered'],pending_payment:['cancelled','expired']};
 const current=await findOrderById(req.params.id);
 if(!current)return res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Order not found.'}});
 if(!(allowed[current.status]||[]).includes(req.body.status))return res.status(409).json({success:false,error:{code:'INVALID_TRANSITION',message:`Cannot change ${current.status} to ${req.body.status}.`}});
 const updated=await updateOrderStatus(req.params.id,req.body.status,req.user.id);
 ok(res,updated);
};

export const createCoupon=async(req,res)=>ok(res,await insertCoupon(req.body),201);
export const dashboard=async(req,res)=>ok(res,await dashboardSummary());

export const aiDiscovery=async(req,res)=>{
 if(typeof req.body.query!=='string'||req.body.query.length>240)return res.status(422).json({success:false,error:{code:'INVALID_QUERY',message:'Enter a search under 240 characters.'}});
 const result=await new ShoeDiscoveryService().recommend(req.body.query);
 const ids=result.recommendations.map(x=>x.productId);
 const found=await findProductsByIds(ids);
 const byId=new Map(found.map(product=>[String(product._id),product]));
 ok(res,{source:result.source,message:result.message,recommendations:result.recommendations.filter(x=>byId.has(x.productId)).map(x=>({product:byId.get(x.productId),reason:x.reason}))});
};

export const webhook=async(req,res)=>{
 const provider=PaymentProviderFactory.create();
 let valid=false,event=req.body;
 if(process.env.PAYMENT_PROVIDER==='paymongo'){
  const signature=req.headers['paymongo-signature'],secret=process.env.PAYMONGO_WEBHOOK_SECRET;
  if(secret&&signature){
   const parts=Object.fromEntries(signature.split(',').map(part=>part.split('=')));
   const timestamp=parts.t||'',supplied=parts.te||parts.li||'';
   const expected=crypto.createHmac('sha256',secret).update(`${timestamp}.${req.rawBody}`).digest('hex');
   const expectedBytes=Buffer.from(expected),suppliedBytes=Buffer.from(supplied);
   valid=!!timestamp&&!!supplied&&expectedBytes.length===suppliedBytes.length&&crypto.timingSafeEqual(expectedBytes,suppliedBytes);
  }
  event=req.body.data;
 }else{
  const signature=req.headers['x-maya-signature']||req.headers['x-paymaya-signature'];
  valid=provider.verifyWebhook(req.rawBody,signature);
 }
 if(!valid)return res.status(401).json({success:false,error:{code:'INVALID_WEBHOOK_SIGNATURE',message:'Invalid payment webhook signature.'}});
 const eventId=String(event?.id||event?.checkoutId||event?.requestReferenceNumber||crypto.randomUUID());
 const type=String(event?.eventType||event?.paymentStatus||event?.status||event?.attributes?.type||'unknown');
 if(!await insertWebhookEvent(eventId,type))return res.sendStatus(200);
 const reference=event?.requestReferenceNumber||event?.attributes?.data?.attributes?.reference_number||event?.referenceNumber;
 const order=reference?await findOrderById(reference):null;
 if(order&&/paid|success|completed/i.test(type)){
  const verification=await provider.verifyPayment(order.paymentReference);
  if(verification?.paid&&Math.round(Number(order.total)*100)===Number(verification.amount)&&verification.currency==='PHP'){
   if(order.status==='pending_payment')await updateOrderStatus(order._id,'paid',`${process.env.PAYMENT_PROVIDER||'maya'}-webhook`);
  }else if(verification){
   await recordPaymentMismatch(order._id,{amount:verification.amount,currency:verification.currency,orderAmount:Math.round(Number(order.total)*100),orderCurrency:'PHP'});
  }
 }
 await markWebhookProcessed(eventId);
 res.sendStatus(200);
};

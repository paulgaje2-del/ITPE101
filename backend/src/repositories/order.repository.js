import {query,withTransaction} from '../config/database.js';

const orderColumns=`id AS "_id",user_id AS "user",items,shipping,subtotal,discount,shipping_fee AS "shippingFee",total,coupon_code AS "couponCode",status,payment_reference AS "paymentReference",payment_url AS "paymentUrl",idempotency_key AS "idempotencyKey",payment_mismatch AS "paymentMismatch",status_history AS "statusHistory",created_at AS "createdAt",updated_at AS "updatedAt"`;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const transaction=withTransaction;

export async function findOrderById(id){
 if(!uuidPattern.test(String(id)))return null;
 const result=await query(`SELECT ${orderColumns} FROM orders WHERE id=$1`,[id]);
 return result.rows[0]||null;
}

export async function findOrderByIdempotency(userId,key){
 const result=await query(`SELECT ${orderColumns} FROM orders WHERE user_id=$1 AND idempotency_key=$2`,[userId,key]);
 return result.rows[0]||null;
}

export async function findOrdersByUser(userId){
 const result=await query(`SELECT ${orderColumns} FROM orders WHERE user_id=$1 ORDER BY created_at DESC`,[userId]);
 return result.rows;
}

export async function findAllOrders(){
 const result=await query(
  `SELECT o.id AS "_id",o.user_id AS "user",o.items,o.shipping,o.subtotal,o.discount,
   o.shipping_fee AS "shippingFee",o.total,o.coupon_code AS "couponCode",o.status,
   o.payment_reference AS "paymentReference",o.payment_url AS "paymentUrl",
   o.idempotency_key AS "idempotencyKey",o.payment_mismatch AS "paymentMismatch",
   o.status_history AS "statusHistory",o.created_at AS "createdAt",o.updated_at AS "updatedAt",
   jsonb_build_object('name',u.name,'email',u.email) AS user
   FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`
 );
 return result.rows;
}

export async function createPendingOrder(client,order){
 const result=await client.query(
  `INSERT INTO orders(user_id,items,shipping,subtotal,discount,shipping_fee,total,coupon_code,idempotency_key,status_history)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING ${orderColumns}`,
  [order.userId,JSON.stringify(order.items),JSON.stringify(order.shipping),order.subtotal,order.discount,order.shippingFee,order.total,order.couponCode||null,order.idempotencyKey,JSON.stringify([{status:'pending_payment',actor:String(order.userId),at:new Date().toISOString()}])]
 );
 return result.rows[0];
}

export async function updatePaymentSession(id,reference,url){
 const result=await query(
  `UPDATE orders SET payment_reference=$2,payment_url=$3,updated_at=now() WHERE id=$1 RETURNING ${orderColumns}`,
  [id,reference,url]
 );
 return result.rows[0]||null;
}

export async function transitionOrderStatus(id,expectedStatus,status,actor){
 if(!uuidPattern.test(String(id)))return null;
 const result=await query(
  `UPDATE orders SET status=$3,status_history=status_history||jsonb_build_array(jsonb_build_object('status',$3,'actor',$4,'at',now())),updated_at=now()
   WHERE id=$1 AND status=$2 RETURNING ${orderColumns}`,
  [id,expectedStatus,status,String(actor)]
 );
 return result.rows[0]||null;
}

export async function recordPaymentMismatch(id,mismatch){
 if(!uuidPattern.test(String(id)))return;
 await query(
  'UPDATE orders SET payment_mismatch=$2,updated_at=now() WHERE id=$1',
  [id,JSON.stringify({...mismatch,recordedAt:new Date().toISOString()})]
 );
}

export async function dashboardSummary(lowStockProducts){
 const [sales,pending,lowStock]=await Promise.all([
  query(`SELECT count(*)::int AS count,coalesce(sum(total),0)::float AS gross FROM orders WHERE status IN ('paid','processing','shipped','delivered')`),
  query(`SELECT count(*)::int AS count FROM orders WHERE status='pending_payment'`),
  lowStockProducts()
 ]);
 return {paidOrders:sales.rows[0].count,grossSales:sales.rows[0].gross,pendingOrders:pending.rows[0].count,lowStock};
}

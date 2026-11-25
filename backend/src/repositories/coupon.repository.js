import {query} from '../config/database.js';

export async function createCoupon(coupon){
 const result=await query(
  `INSERT INTO coupons(code,type,value,min_spend,expires_at,usage_limit,per_customer_limit,active)
   VALUES(upper($1),$2,$3,$4,$5,$6,$7,$8)
   RETURNING code,type,value,min_spend AS "minSpend",expires_at AS "expiresAt",usage_limit AS "usageLimit",used_count AS "usedCount",per_customer_limit AS "perCustomerLimit",active`,
  [coupon.code,coupon.type,coupon.value,coupon.minSpend||0,coupon.expiresAt||null,coupon.usageLimit,coupon.perCustomerLimit||1,coupon.active!==false]
 );
 return result.rows[0];
}

export async function findActiveCouponForUpdate(client,code){
 const result=await client.query(
  'SELECT * FROM coupons WHERE code=upper($1) AND active=true FOR UPDATE',
  [code]
 );
 return result.rows[0]||null;
}

export async function incrementCouponUsage(client,code){
 await client.query('UPDATE coupons SET used_count=used_count+1 WHERE code=$1',[code]);
}

export async function countCouponRedemptionsForUser(client,code,userId){
 const result=await client.query(
  'SELECT count(*)::int AS count FROM coupon_redemptions WHERE coupon_code=$1 AND user_id=$2',
  [code,userId]
 );
 return result.rows[0].count;
}

export async function recordCouponRedemption(client,{code,userId,orderId}){
 await client.query(
  'INSERT INTO coupon_redemptions(coupon_code,user_id,order_id) VALUES($1,$2,$3)',
  [code,userId,orderId]
 );
}

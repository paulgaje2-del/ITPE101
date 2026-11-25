import {query,withTransaction} from '../config/database.js';

const productColumns=`id AS "_id",name,slug,brand,category,description,price,image,sizes,colors,stock,featured,active,material,sport,created_at AS "createdAt",updated_at AS "updatedAt"`;
const orderColumns=`id AS "_id",user_id AS "user",items,shipping,subtotal,discount,shipping_fee AS "shippingFee",total,coupon_code AS "couponCode",status,payment_reference AS "paymentReference",payment_url AS "paymentUrl",idempotency_key AS "idempotencyKey",payment_mismatch AS "paymentMismatch",status_history AS "statusHistory",created_at AS "createdAt",updated_at AS "updatedAt"`;
const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validId=id=>uuidPattern.test(String(id));

export async function findUserByEmail(email,includePassword=false){
 const result=await query(`SELECT id,name,email,role${includePassword?',password':''} FROM users WHERE email=lower($1)`,[email]);
 return result.rows[0]||null;
}
export async function findUserById(id){
 if(!validId(id))return null;
 const result=await query('SELECT id,name,email,role FROM users WHERE id=$1',[id]);
 return result.rows[0]||null;
}
export async function createUser({name,email,password}){
 const result=await query('INSERT INTO users(name,email,password) VALUES($1,lower($2),$3) RETURNING id,name,email,role',[name,email,password]);
 return result.rows[0];
}

export async function listProducts({q,category,sort='newest',page=1,limit=12}){
 const conditions=['active=true'];const values=[];
 if(q){values.push(`%${q}%`);conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length} OR brand ILIKE $${values.length})`);}
 if(category){values.push(category);conditions.push(`category=$${values.length}`);}
 const where=conditions.join(' AND ');
 const sortBy=sort==='price-low'?'price ASC':sort==='price-high'?'price DESC':'created_at DESC';
 const count=await query(`SELECT count(*)::int AS total FROM products WHERE ${where}`,values);
 values.push(limit,page);
 const result=await query(`SELECT ${productColumns} FROM products WHERE ${where} ORDER BY ${sortBy} LIMIT $${values.length-1} OFFSET (($${values.length})::int-1)*$${values.length-1}`,values);
 return {data:result.rows,total:count.rows[0].total};
}
export async function findProduct(id,{activeOnly=false}={}){
 if(!validId(id))return null;
 const result=await query(`SELECT ${productColumns} FROM products WHERE id=$1${activeOnly?' AND active=true':''}`,[id]);
 return result.rows[0]||null;
}
export async function findProductsByIds(ids){
 const valid=ids.filter(validId);
 if(!valid.length)return [];
 const result=await query(`SELECT ${productColumns} FROM products WHERE id=ANY($1::uuid[]) AND active=true AND stock>0`,[valid]);
 return result.rows;
}
export async function searchProducts(searchTerms){
 if(!searchTerms.length)return [];
 const values=[];const terms=searchTerms.map(term=>{values.push(`%${term}%`);return `(name ILIKE $${values.length} OR category ILIKE $${values.length} OR description ILIKE $${values.length})`;});
 const result=await query(`SELECT ${productColumns} FROM products WHERE active=true AND stock>0 AND (${terms.join(' OR ')}) ORDER BY featured DESC,created_at DESC LIMIT 8`,values);
 return result.rows;
}
export async function createProduct(product){
 const slug=product.slug||product.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
 const result=await query(`INSERT INTO products(name,slug,brand,category,description,price,image,sizes,colors,stock,featured,active,material,sport)
 VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING ${productColumns}`,
 [product.name,slug,product.brand||'SOLEVA',product.category,product.description,product.price,product.image,product.sizes||[],product.colors||[],product.stock,product.featured||false,product.active!==false,product.material||null,product.sport||null]);
 return result.rows[0];
}
export async function updateProduct(id,updates){
 if(!validId(id))return null;
 const columns={name:'name',slug:'slug',brand:'brand',category:'category',description:'description',price:'price',image:'image',sizes:'sizes',colors:'colors',stock:'stock',featured:'featured',active:'active',material:'material',sport:'sport'};
 const fields=Object.entries(updates).filter(([key,value])=>columns[key]&&value!==undefined);
 if(!fields.length)return findProduct(id);
 const values=fields.map(([,value])=>value);
 const assignments=fields.map(([key],index)=>`${columns[key]}=$${index+2}`).concat('updated_at=now()');
 const result=await query(`UPDATE products SET ${assignments.join(',')} WHERE id=$1 RETURNING ${productColumns}`,[id,...values]);
 return result.rows[0]||null;
}
export async function deactivateProduct(id){return updateProduct(id,{active:false});}
export async function lowStockProducts(){
 const result=await query(`SELECT ${productColumns} FROM products WHERE active=true AND stock<=5 ORDER BY stock ASC`);
 return result.rows;
}

export async function createCoupon(coupon){
 const result=await query(`INSERT INTO coupons(code,type,value,min_spend,expires_at,usage_limit,per_customer_limit,active)
 VALUES(upper($1),$2,$3,$4,$5,$6,$7,$8) RETURNING code,type,value,min_spend AS "minSpend",expires_at AS "expiresAt",usage_limit AS "usageLimit",used_count AS "usedCount",per_customer_limit AS "perCustomerLimit",active`,
 [coupon.code,coupon.type,coupon.value,coupon.minSpend||0,coupon.expiresAt||null,coupon.usageLimit,coupon.perCustomerLimit||1,coupon.active!==false]);
 return result.rows[0];
}

export async function findOrderById(id){
 if(!validId(id))return null;
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
 const result=await query(`SELECT o.id AS "_id",o.user_id AS "user",o.items,o.shipping,o.subtotal,o.discount,
 o.shipping_fee AS "shippingFee",o.total,o.coupon_code AS "couponCode",o.status,
 o.payment_reference AS "paymentReference",o.payment_url AS "paymentUrl",
 o.idempotency_key AS "idempotencyKey",o.payment_mismatch AS "paymentMismatch",
 o.status_history AS "statusHistory",o.created_at AS "createdAt",o.updated_at AS "updatedAt",
 jsonb_build_object('name',u.name,'email',u.email) AS user
 FROM orders o JOIN users u ON u.id=o.user_id ORDER BY o.created_at DESC`);
 return result.rows;
}
export async function updatePaymentSession(id,reference,url){
 const result=await query(`UPDATE orders SET payment_reference=$2,payment_url=$3,updated_at=now() WHERE id=$1 RETURNING ${orderColumns}`,[id,reference,url]);
 return result.rows[0]||null;
}
export async function updateOrderStatus(id,status,actor){
 if(!validId(id))return null;
 const result=await query(`UPDATE orders SET status=$2,status_history=status_history||jsonb_build_array(jsonb_build_object('status',$2,'actor',$3,'at',now())),updated_at=now() WHERE id=$1 RETURNING ${orderColumns}`,[id,status,String(actor)]);
 return result.rows[0]||null;
}
export async function recordPaymentMismatch(id,mismatch){
 await query('UPDATE orders SET payment_mismatch=$2,updated_at=now() WHERE id=$1',[id,JSON.stringify({...mismatch,recordedAt:new Date().toISOString()})]);
}
export async function dashboardSummary(){
 const [sales,pending,lowStock]=await Promise.all([
  query(`SELECT count(*)::int AS count,coalesce(sum(total),0)::float AS gross FROM orders WHERE status IN ('paid','processing','shipped','delivered')`),
  query(`SELECT count(*)::int AS count FROM orders WHERE status='pending_payment'`),
  lowStockProducts()
 ]);
 return {paidOrders:sales.rows[0].count,grossSales:sales.rows[0].gross,pendingOrders:pending.rows[0].count,lowStock};
}
export async function insertWebhookEvent(eventId,type){
 const result=await query('INSERT INTO webhook_events(event_id,type) VALUES($1,$2) ON CONFLICT(event_id) DO NOTHING RETURNING event_id',[eventId,type]);
 return result.rowCount===1;
}
export async function markWebhookProcessed(eventId){
 await query('UPDATE webhook_events SET processed=true WHERE event_id=$1',[eventId]);
}

export async function transaction(work){return withTransaction(work);}

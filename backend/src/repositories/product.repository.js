import {query} from '../config/database.js';

const productColumns=`id AS "_id",name,slug,brand,category,description,price,image,sizes,colors,stock,featured,active,material,sport,created_at AS "createdAt",updated_at AS "updatedAt"`;

export async function listProducts({q,category,sort='newest',page=1,limit=12}){
 const conditions=['active=true'];
 const values=[];
 if(q){values.push(`%${q}%`);conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length} OR brand ILIKE $${values.length})`);}
 if(category){values.push(category);conditions.push(`category=$${values.length}`);}
 const where=conditions.join(' AND ');
 const sortBy=sort==='price-low'?'price ASC':sort==='price-high'?'price DESC':'created_at DESC';
 const count=await query(`SELECT count(*)::int AS total FROM products WHERE ${where}`,values);
 values.push(limit,page);
 const result=await query(
  `SELECT ${productColumns} FROM products WHERE ${where} ORDER BY ${sortBy} LIMIT $${values.length-1} OFFSET (($${values.length})::int-1)*$${values.length-1}`,
  values
 );
 return {data:result.rows,total:count.rows[0].total};
}

export async function listManagedProducts(q=''){
 const values=[];
 let where='';
 if(q){
  values.push(`%${q}%`);
  where=`WHERE name ILIKE $1 OR category ILIKE $1 OR description ILIKE $1`;
 }
 const result=await query(
  `SELECT ${productColumns} FROM products ${where} ORDER BY active DESC,created_at DESC`,
  values
 );
 return result.rows;
}

export async function findProduct(id,{activeOnly=false}={}){
 const result=await query(`SELECT ${productColumns} FROM products WHERE id=$1${activeOnly?' AND active=true':''}`,[id]);
 return result.rows[0]||null;
}

export async function findProductsByIds(ids){
 if(!ids.length)return [];
 const result=await query(
  `SELECT ${productColumns} FROM products WHERE id=ANY($1::uuid[]) AND active=true AND stock>0`,
  [ids]
 );
 return result.rows;
}

export async function searchProducts(searchTerms){
 if(!searchTerms.length)return [];
 const values=[];
 const terms=searchTerms.map(term=>{
  values.push(`%${term}%`);
  return `(name ILIKE $${values.length} OR category ILIKE $${values.length} OR description ILIKE $${values.length})`;
 });
 const result=await query(
  `SELECT ${productColumns} FROM products WHERE active=true AND stock>0 AND (${terms.join(' OR ')}) ORDER BY featured DESC,created_at DESC LIMIT 8`,
  values
 );
 return result.rows;
}

export async function listFinderProducts(){
 const result=await query(
  `SELECT ${productColumns} FROM products WHERE active=true AND stock>0 ORDER BY featured DESC,created_at DESC LIMIT 200`
 );
 return result.rows;
}

export async function createProduct(product){
 const slug=product.slug||product.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
 const result=await query(
  `INSERT INTO products(name,slug,brand,category,description,price,image,sizes,colors,stock,featured,active,material,sport)
   VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING ${productColumns}`,
  [product.name,slug,product.brand||'SOLEVA',product.category,product.description,product.price,product.image,product.sizes||[],product.colors||[],product.stock,product.featured||false,product.active!==false,product.material||null,product.sport||null]
 );
 return result.rows[0];
}

export async function updateProduct(id,updates){
 const columns={name:'name',slug:'slug',brand:'brand',category:'category',description:'description',price:'price',image:'image',sizes:'sizes',colors:'colors',stock:'stock',featured:'featured',active:'active',material:'material',sport:'sport'};
 const fields=Object.entries(updates).filter(([key,value])=>columns[key]&&value!==undefined);
 if(!fields.length)return findProduct(id);
 const values=fields.map(([,value])=>value);
 const assignments=fields.map(([key],index)=>`${columns[key]}=$${index+2}`).concat('updated_at=now()');
 const result=await query(`UPDATE products SET ${assignments.join(',')} WHERE id=$1 RETURNING ${productColumns}`,[id,...values]);
 return result.rows[0]||null;
}

export async function deactivateProduct(id){
 return updateProduct(id,{active:false});
}

export async function lowStockProducts(){
 const result=await query(`SELECT ${productColumns} FROM products WHERE active=true AND stock<=5 ORDER BY stock ASC`);
 return result.rows;
}

export async function findPurchasableProductForUpdate(client,id){
 const result=await client.query('SELECT * FROM products WHERE id=$1 AND active=true FOR UPDATE',[id]);
 return result.rows[0]||null;
}

export async function reserveStock(client,id,quantity){
 const result=await client.query(
  'UPDATE products SET stock=stock-$2,updated_at=now() WHERE id=$1 AND stock >= $2',
  [id,quantity]
 );
 return result.rowCount===1;
}

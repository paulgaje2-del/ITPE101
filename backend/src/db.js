import {readFile} from 'node:fs/promises';
import pg from 'pg';

const {Pool}=pg;
let pool;

export function getPool(){
 if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is required. Add your Supabase PostgreSQL connection string to backend/.env.');
 if(!pool)pool=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false},max:5});
 return pool;
}

export const query=(text,values)=>getPool().query(text,values);

export async function withTransaction(work){
 const client=await getPool().connect();
 try{
  await client.query('BEGIN');
  const result=await work(client);
  await client.query('COMMIT');
  return result;
 }catch(error){
  await client.query('ROLLBACK');
  throw error;
 }finally{
  client.release();
 }
}

export async function initializeDatabase(){
 const schema=await readFile(new URL('../schema.sql',import.meta.url),'utf8');
 await query(schema);
}

export async function closeDatabase(){
 if(pool){await pool.end();pool=undefined;}
}

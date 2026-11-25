import {query} from '../config/database.js';

export async function findUserByEmail(email,{includePassword=false}={}){
 const result=await query(
  `SELECT id,name,email,role${includePassword?',password':''} FROM users WHERE email=lower($1)`,
  [email]
 );
 return result.rows[0]||null;
}

export async function findUserById(id){
 const result=await query('SELECT id,name,email,role FROM users WHERE id=$1',[id]);
 return result.rows[0]||null;
}

export async function createUser({name,email,password}){
 const result=await query(
  'INSERT INTO users(name,email,password) VALUES($1,lower($2),$3) RETURNING id,name,email,role',
  [name,email,password]
 );
 return result.rows[0];
}

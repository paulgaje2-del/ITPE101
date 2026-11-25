import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {createUser,findUserByEmail} from '../repositories/user.repository.js';
import {httpError} from '../utils/errors.js';
import {toPublicUser} from '../models/user.model.js';

function createToken(user){
 return jwt.sign(
  {id:user.id,role:user.role,name:user.name},
  process.env.JWT_SECRET,
  {expiresIn:'2h'}
 );
}

export async function registerCustomer(input){
 if(await findUserByEmail(input.email)){
  throw httpError('An account with this email already exists.',409,'EMAIL_EXISTS');
 }
 const user=await createUser({
  name:input.name,
  email:input.email,
  password:await bcrypt.hash(input.password,12)
 });
 return {token:createToken(user),user:toPublicUser(user)};
}

export async function loginCustomer(input){
 const user=await findUserByEmail(input.email,{includePassword:true});
 if(!user||!await bcrypt.compare(input.password,user.password)){
  throw httpError('Email or password is incorrect.',401,'INVALID_CREDENTIALS');
 }
 return {token:createToken(user),user:toPublicUser(user)};
}

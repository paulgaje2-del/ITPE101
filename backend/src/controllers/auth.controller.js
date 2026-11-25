import {loginCustomer,registerCustomer} from '../services/auth.service.js';
import {sendSuccess} from '../utils/http.js';

export async function register(req,res){
 sendSuccess(res,await registerCustomer(req.validated.body),201);
}

export async function login(req,res){
 sendSuccess(res,await loginCustomer(req.validated.body));
}

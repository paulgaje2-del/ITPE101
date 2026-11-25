import {getProduct,listCatalog} from '../services/product.service.js';
import {sendSuccess} from '../utils/http.js';

export async function listProducts(req,res){
 const options=req.validated.query;
 const {data,total}=await listCatalog(options);
 sendSuccess(res,data,200,{total,page:options.page,limit:options.limit});
}

export async function getProductDetails(req,res){
 sendSuccess(res,await getProduct(req.validated.params.id));
}

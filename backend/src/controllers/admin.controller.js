import {
 createProduct as insertProduct,
 deactivateProduct as deactivateShoe,
 listManagedCatalog,
 updateProduct as updateShoe
} from '../services/product.service.js';
import {createStoreCoupon} from '../services/coupon.service.js';
import {changeOrderStatus,getDashboard,listAllOrders} from '../services/admin.service.js';
import {sendSuccess} from '../utils/http.js';

export async function createProduct(req,res){
 sendSuccess(res,await insertProduct(req.validated.body),201);
}

export async function listProducts(req,res){
 sendSuccess(res,await listManagedCatalog(req.validated.query.q));
}

export async function updateProduct(req,res){
 sendSuccess(res,await updateShoe(req.validated.params.id,req.validated.body));
}

export async function deactivateProduct(req,res){
 sendSuccess(res,await deactivateShoe(req.validated.params.id));
}

export async function createCoupon(req,res){
 sendSuccess(res,await createStoreCoupon(req.validated.body),201);
}

export async function dashboard(req,res){
 sendSuccess(res,await getDashboard());
}

export async function listOrders(req,res){
 sendSuccess(res,await listAllOrders());
}

export async function updateOrderStatus(req,res){
 sendSuccess(res,await changeOrderStatus(
  req.validated.params.id,
  req.validated.body.status,
  req.user.id
 ));
}

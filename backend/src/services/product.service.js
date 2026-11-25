import * as products from '../repositories/product.repository.js';
import {httpError} from '../utils/errors.js';

export function listCatalog(options){
 return products.listProducts(options);
}

export function listManagedCatalog(query=''){
 return products.listManagedProducts(query);
}

export async function getProduct(id,{activeOnly=true}={}){
 const product=await products.findProduct(id,{activeOnly});
 if(!product)throw httpError('Shoe not found.',404,'PRODUCT_NOT_FOUND');
 return product;
}

export function createProduct(input){
 return products.createProduct(input);
}

export async function updateProduct(id,input){
 const product=await products.updateProduct(id,input);
 if(!product)throw httpError('Shoe not found.',404,'PRODUCT_NOT_FOUND');
 return product;
}

export async function deactivateProduct(id){
 const product=await products.deactivateProduct(id);
 if(!product)throw httpError('Shoe not found.',404,'PRODUCT_NOT_FOUND');
 return product;
}

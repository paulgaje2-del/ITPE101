import {Router} from 'express';
import {auth,admin} from '../middleware/auth.js';
import {products,productDetail,createProduct,updateProduct,deleteProduct} from '../controllers/controllers.js';

const router=Router();
router.get('/products',products);
router.get('/products/:id',productDetail);
router.post('/admin/products',auth,admin,createProduct);
router.patch('/admin/products/:id',auth,admin,updateProduct);
router.delete('/admin/products/:id',auth,admin,deleteProduct);

export default router;

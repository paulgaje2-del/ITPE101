import {Router} from 'express';
import {auth,admin} from '../middleware/auth.js';
import {getProductDetails,listProducts} from '../controllers/product.controller.js';
import {createProduct,deactivateProduct,listProducts as listManagedProducts,updateProduct} from '../controllers/admin.controller.js';
import {validate} from '../middleware/validate.js';
import {asyncHandler} from '../utils/async.js';
import {managedProductQuerySchema,productIdSchema,productInputSchema,productQuerySchema,productUpdateSchema} from '../validators/product.validator.js';

const router=Router();
router.get('/products',validate(productQuerySchema,'query'),asyncHandler(listProducts));
router.get('/products/:id',validate(productIdSchema,'params'),asyncHandler(getProductDetails));
router.get('/admin/products',auth,admin,validate(managedProductQuerySchema,'query'),asyncHandler(listManagedProducts));
router.post('/admin/products',auth,admin,validate(productInputSchema),asyncHandler(createProduct));
router.patch('/admin/products/:id',auth,admin,validate(productIdSchema,'params'),validate(productUpdateSchema),asyncHandler(updateProduct));
router.delete('/admin/products/:id',auth,admin,validate(productIdSchema,'params'),asyncHandler(deactivateProduct));

export default router;

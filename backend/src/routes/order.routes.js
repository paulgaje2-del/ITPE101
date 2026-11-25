import {Router} from 'express';
import {auth,admin} from '../middleware/auth.js';
import {checkout,listMyOrders} from '../controllers/order.controller.js';
import {dashboard,listOrders,updateOrderStatus} from '../controllers/admin.controller.js';
import {validate} from '../middleware/validate.js';
import {asyncHandler} from '../utils/async.js';
import {checkoutSchema,idempotencyHeaderSchema,orderIdSchema,orderStatusSchema} from '../validators/order.validator.js';

const router=Router();
router.post('/checkout',auth,validate(checkoutSchema),validate(idempotencyHeaderSchema,'headers'),asyncHandler(checkout));
router.get('/orders/me',auth,asyncHandler(listMyOrders));
router.get('/admin/dashboard',auth,admin,asyncHandler(dashboard));
router.get('/admin/orders',auth,admin,asyncHandler(listOrders));
router.patch('/admin/orders/:id/status',auth,admin,validate(orderIdSchema,'params'),validate(orderStatusSchema),asyncHandler(updateOrderStatus));

export default router;

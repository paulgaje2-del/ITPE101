import {Router} from 'express';
import {auth,admin} from '../middleware/auth.js';
import {checkout,myOrders,adminOrders,updateOrder,dashboard} from '../controllers/controllers.js';

const router=Router();
router.post('/checkout',auth,checkout);
router.get('/orders/me',auth,myOrders);
router.get('/admin/dashboard',auth,admin,dashboard);
router.get('/admin/orders',auth,admin,adminOrders);
router.patch('/admin/orders/:id/status',auth,admin,updateOrder);

export default router;

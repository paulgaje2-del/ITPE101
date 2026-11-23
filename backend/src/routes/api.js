import {Router} from 'express';import rateLimit from 'express-rate-limit';import {auth,admin} from '../middleware/auth.js';import * as c from '../controllers/controllers.js';
const r=Router();const aiLimit=rateLimit({windowMs:60_000,max:8,standardHeaders:true,legacyHeaders:false});
r.post('/auth/register',c.register);r.post('/auth/login',c.login);
r.get('/products',c.products);r.get('/products/:id',c.productDetail);r.post('/ai/shoe-finder',aiLimit,c.aiDiscovery);
r.post('/checkout',auth,c.checkout);r.get('/orders/me',auth,c.myOrders);
r.get('/admin/dashboard',auth,admin,c.dashboard);r.get('/admin/orders',auth,admin,c.adminOrders);r.patch('/admin/orders/:id/status',auth,admin,c.updateOrder);
r.post('/admin/products',auth,admin,c.createProduct);r.patch('/admin/products/:id',auth,admin,c.updateProduct);r.delete('/admin/products/:id',auth,admin,c.deleteProduct);r.post('/admin/coupons',auth,admin,c.createCoupon);
export default r;

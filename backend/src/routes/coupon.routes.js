import {Router} from 'express';
import {auth,admin} from '../middleware/auth.js';
import {createCoupon} from '../controllers/controllers.js';

const router=Router();
router.post('/admin/coupons',auth,admin,createCoupon);

export default router;

import {Router} from 'express';
import {auth,admin} from '../middleware/auth.js';
import {createCoupon} from '../controllers/admin.controller.js';
import {validate} from '../middleware/validate.js';
import {asyncHandler} from '../utils/async.js';
import {couponInputSchema} from '../validators/coupon.validator.js';

const router=Router();
router.post('/admin/coupons',auth,admin,validate(couponInputSchema),asyncHandler(createCoupon));

export default router;

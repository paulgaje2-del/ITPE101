import {Router} from 'express';
import {register,login} from '../controllers/auth.controller.js';
import {validate} from '../middleware/validate.js';
import {asyncHandler} from '../utils/async.js';
import {registerSchema,loginSchema} from '../validators/auth.validator.js';

const router=Router();
router.post('/auth/register',validate(registerSchema),asyncHandler(register));
router.post('/auth/login',validate(loginSchema),asyncHandler(login));

export default router;

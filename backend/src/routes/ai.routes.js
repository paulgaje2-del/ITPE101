import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {discoverShoes} from '../controllers/ai.controller.js';
import {validate} from '../middleware/validate.js';
import {asyncHandler} from '../utils/async.js';
import {aiQuerySchema} from '../validators/ai.validator.js';

const aiLimit=rateLimit({windowMs:60_000,max:8,standardHeaders:true,legacyHeaders:false});
const router=Router();
router.post('/ai/shoe-finder',aiLimit,validate(aiQuerySchema),asyncHandler(discoverShoes));

export default router;

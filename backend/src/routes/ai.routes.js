import {Router} from 'express';
import rateLimit from 'express-rate-limit';
import {aiDiscovery} from '../controllers/controllers.js';

const aiLimit=rateLimit({windowMs:60_000,max:8,standardHeaders:true,legacyHeaders:false});
const router=Router();
router.post('/ai/shoe-finder',aiLimit,aiDiscovery);

export default router;

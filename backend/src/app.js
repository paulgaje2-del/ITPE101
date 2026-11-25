import express from 'express';
import {readFileSync} from 'node:fs';
import YAML from 'yaml';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import {env} from './config/env.js';
import {notFound,errors} from './middleware/errors.js';
import {sendSuccess} from './utils/http.js';
import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import couponRoutes from './routes/coupon.routes.js';
import aiRoutes from './routes/ai.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app=express();
app.set('trust proxy',1);
app.use(helmet());
app.use(cors({
 origin(origin,callback){
  if(!origin||env.clientOrigins.includes(origin))return callback(null,true);
  return callback(new Error('Origin is not allowed by CORS.'));
 },
 credentials:true
}));
app.use(morgan('dev'));
app.use('/api/v1',paymentRoutes);
app.use(express.json({limit:'20kb'}));
app.get('/api/health',(req,res)=>sendSuccess(res,{service:'SOLEVA API',status:'online'}));
app.use('/api/v1',authRoutes);
app.use('/api/v1',productRoutes);
app.use('/api/v1',orderRoutes);
app.use('/api/v1',couponRoutes);
app.use('/api/v1',aiRoutes);
const openapi=YAML.parse(readFileSync(new URL('../openapi.yaml',import.meta.url),'utf8'));
app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(openapi));
app.use(notFound);
app.use(errors);
export default app;

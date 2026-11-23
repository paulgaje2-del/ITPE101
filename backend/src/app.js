import express from 'express';import {readFileSync} from 'node:fs';import YAML from 'yaml';import cors from 'cors';import helmet from 'helmet';import morgan from 'morgan';import swaggerUi from 'swagger-ui-express';import api from './routes/api.js';import {webhook} from './controllers/controllers.js';import {notFound,errors} from './middleware/errors.js';
const app=express();app.use(helmet());app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));app.use(morgan('dev'));
app.post('/api/v1/payments/webhook',express.raw({type:'application/json'}),(req,res,next)=>{req.rawBody=req.body;try{req.body=JSON.parse(req.body.toString());next();}catch{res.sendStatus(400);}},webhook);
app.use(express.json({limit:'20kb'}));app.get('/api/health',(req,res)=>res.json({success:true,data:{service:'SOLEVA API',status:'online'}}));
app.use('/api/v1',api);const openapi=YAML.parse(readFileSync(new URL('../openapi.yaml',import.meta.url),'utf8'));app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(openapi));
app.use(notFound);app.use(errors);export default app;

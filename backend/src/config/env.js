import 'dotenv/config';

const required=['DATABASE_URL','JWT_SECRET'];
const clientUrl=process.env.CLIENT_URL||'http://localhost:5173';
const developmentOrigins=process.env.NODE_ENV==='production'
 ?[]
 :['http://127.0.0.1:5173'];

export function validateEnvironment(){
 const missing=required.filter(name=>!process.env[name]);
 if(missing.length)throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env={
 port:Number(process.env.PORT||5000),
 clientUrl,
 clientOrigins:[...new Set([clientUrl,...developmentOrigins])],
 paymentProvider:process.env.PAYMENT_PROVIDER||'maya'
};

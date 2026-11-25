import 'dotenv/config';

const required=['DATABASE_URL','JWT_SECRET'];

export function validateEnvironment(){
 const missing=required.filter(name=>!process.env[name]);
 if(missing.length)throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const env={
 port:Number(process.env.PORT||5000),
 clientUrl:process.env.CLIENT_URL||'http://localhost:5173',
 clientOrigins:[
  process.env.CLIENT_URL||'http://localhost:5173',
  'https://localhost',
  'capacitor://localhost'
 ],
 paymentProvider:process.env.PAYMENT_PROVIDER||'maya'
};

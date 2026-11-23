import 'dotenv/config';import app from './app.js';import {initializeDatabase,closeDatabase} from './db.js';
const port=process.env.PORT||5000;
try{
 await initializeDatabase();
 const server=app.listen(port,()=>console.log(`SOLEVA API listening on ${port}`));
 const shutdown=async()=>{server.close(async()=>{await closeDatabase();process.exit(0);});};
 process.on('SIGINT',shutdown);
 process.on('SIGTERM',shutdown);
}catch(error){
 console.error('Database connection failed:',error.message);
 process.exit(1);
}

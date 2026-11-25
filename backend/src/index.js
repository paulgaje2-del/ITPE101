import app from './app.js';
import {env,validateEnvironment} from './config/env.js';
import {initializeDatabase,closeDatabase} from './config/database.js';

validateEnvironment();
const port=env.port;
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

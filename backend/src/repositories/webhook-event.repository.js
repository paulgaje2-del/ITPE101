import {query} from '../config/database.js';

export async function insertWebhookEvent(eventId,type){
 const result=await query(
  'INSERT INTO webhook_events(event_id,type) VALUES($1,$2) ON CONFLICT(event_id) DO NOTHING RETURNING event_id',
  [eventId,type]
 );
 return result.rowCount===1;
}

export async function markWebhookProcessed(eventId){
 await query('UPDATE webhook_events SET processed=true WHERE event_id=$1',[eventId]);
}

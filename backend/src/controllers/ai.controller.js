import {ShoeDiscoveryService} from '../services/aiService.js';
import {sendSuccess} from '../utils/http.js';

export async function discoverShoes(req,res){
 const result=await new ShoeDiscoveryService().recommend(req.validated.body.query);
 sendSuccess(res,result);
}

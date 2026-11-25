import {httpError} from '../utils/errors.js';

export function validate(schema,source='body'){
 return (req,res,next)=>{
  const result=schema.safeParse(req[source]);
  if(!result.success){
   return next(Object.assign(
    httpError('Request validation failed.',422,'VALIDATION_ERROR'),
    {details:result.error.issues.map(issue=>({path:issue.path.join('.'),message:issue.message}))}
   ));
  }
  req.validated={...req.validated,[source]:result.data};
  return next();
 };
}

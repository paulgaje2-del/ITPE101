export function notFound(req,res){
 res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'The requested resource was not found.'}});
}

export function errors(err,req,res,next){
 if(res.headersSent)return next(err);
 const status=err.status||(
  err.code==='23505'?409:
  err.type==='entity.parse.failed'?400:
  500
 );
 if(status>=500)console.error(err);
 res.status(status).json({
  success:false,
  error:{
   code:status===500?'INTERNAL_ERROR':(err.code||'REQUEST_ERROR'),
   message:status===500?'An unexpected error occurred.':err.message,
   ...(err.details?{details:err.details}:{})
  }
 });
}

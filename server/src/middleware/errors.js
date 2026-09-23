export function notFound(req,res){res.status(404).json({success:false,error:{code:'NOT_FOUND',message:'Resource not found'}});}
export function errorHandler(err,_req,res,_next){
 if(err.code?.startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({success:false,error:{code:'CONFLICT',message:'That record already exists or conflicts with existing data'}});
 if(process.env.NODE_ENV !== 'test') console.error('Request failed:',err.name);
 res.status(err.status||500).json({success:false,error:{code:'INTERNAL_ERROR',message:err.status?err.message:'An unexpected error occurred'}});
}

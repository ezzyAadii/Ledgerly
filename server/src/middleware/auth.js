import jwt from 'jsonwebtoken';
import config from '../config.js';
export function authenticate(req,res,next){
 const header=req.get('authorization');
 if(!header?.startsWith('Bearer ')) return res.status(401).json({success:false,error:{code:'UNAUTHORIZED',message:'Authentication required'}});
 try { const payload=jwt.verify(header.slice(7),config.jwtSecret,{algorithms:['HS256']}); req.user={id:Number(payload.sub)}; if(!req.user.id) throw new Error(); next(); }
 catch { return res.status(401).json({success:false,error:{code:'INVALID_TOKEN',message:'Token is invalid or expired'}}); }
}

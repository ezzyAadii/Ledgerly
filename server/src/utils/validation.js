import { z } from 'zod';
export const email = z.string().trim().email().max(254).transform(v=>v.toLowerCase());
export const password = z.string().min(8).max(128).regex(/[A-Za-z]/,'Must include a letter').regex(/\d/,'Must include a number');
export const positiveMoney = z.coerce.number().positive().max(1_000_000_000);
export const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'Use YYYY-MM-DD');
export const idParam = z.coerce.number().int().positive();
export function validate(schema, source='body'){ return (req,res,next)=>{ const r=schema.safeParse(req[source]); if(!r.success) return res.status(400).json({success:false,error:{code:'VALIDATION_ERROR',message:'Invalid request',details:r.error.flatten()}}); req[source]=r.data; next(); }; }

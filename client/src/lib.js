const BASE=import.meta.env.VITE_API_URL||'/api';
export async function api(path,{token,body,...options}={}){const res=await fetch(`${BASE}${path}`,{...options,headers:{...(body?{'Content-Type':'application/json'}:{}),...(token?{Authorization:`Bearer ${token}`}:{})},body:body?JSON.stringify(body):undefined});if(res.status===204)return null;const json=await res.json().catch(()=>({success:false,error:{message:'Invalid server response'}}));if(!res.ok)throw new Error(json.error?.message||'Request failed');return json.data;}
export const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(Number(n||0));
export const today=()=>new Date().toISOString().slice(0,10);
export const categories=['Housing','Food & Dining','Transport','Utilities','Healthcare','Education','Entertainment','Shopping','Salary','Freelance','Investment','Other'];

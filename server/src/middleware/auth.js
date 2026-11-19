import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
export async function requireAuth(req,res,next){
    try{
        const h=req.headers.authorization||'';

        const token=h.startsWith('Bearer ')?h.slice(7):'';

        if(!token)return res.status(401).json({message:'Authentication required.'});

        const payload=jwt.verify(token,process.env.JWT_SECRET);

        const admin=await Admin.findById(payload.sub).select('_id name email role organizationId isActive');

        if(!admin||!admin.isActive)return res.status(401).json({message:'Account unavailable.'});

        req.admin=admin;next();
         }catch{
            return res.status(401).json({message:'Invalid or expired session.'});
        }}
export function allowRoles(...roles){
    return (req,res,next)=>roles.includes(req.admin?.role)?next():res.status(403).json({message:'Insufficient role permissions.'});
}

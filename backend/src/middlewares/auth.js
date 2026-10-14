import jwt from "jsonwebtoken"


const authmiddleware = (req,res,next) =>{
    try{
    const token = req.cookies?.accesstoken || (req.headers.authorization && req.headers.authorization.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if(!token){
        return res.status(401).json({message:"Access Denied"});
    }
    
    const key = process.env.KEY ; 

    const decode = jwt.verify(token,key);

    req.user = decode;
    next();
    }catch(error){
     console.log(error);
     if(error.name === "TokenExpiredError"){
        return res.status(401).json({message:"Token expired", expired: true});
     }
     if(error.name === "JsonWebTokenError"){
        return res.status(401).json({message:"Invalid token"});
     }
     res.status(500).json({message:"Internal server error"});
    }

}

// Admin-only middleware — use after authmiddleware
export const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    next();
}

export default authmiddleware;
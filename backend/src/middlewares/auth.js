import jwt from "jsonwebtoken"


const authmiddleware = (req,res,next) =>{
    try{
    const token = req.cookies.accesstoken;

    if(!token){
        return res.status(401).json({message:"Access Denied"});
    }
    
    const key = process.env.KEY ; 

    const decode = jwt.verify(token,key);

    req.user = decode;
    next();
    }catch(error){
     console.log(error);
     res.status(500).json({message:"Internal server error"});
    }

}

export default authmiddleware;
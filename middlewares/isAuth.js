const jwt = require("jsonwebtoken");

const isAuth = (req,res,next)=>{
    const authToken=req.get("Authorization");
    if(!authToken)
    {
        const error = new Error("Not authorized");
        error.errorCode=401;
        throw error;
    }
    let decodedToken;
    try
    {
        decodedToken = jwt.verify(authToken,"testtest2137");
    }
    catch(error)
    {
        error.statusCode= 500;
        throw error;
    }
    if(!decodedToken || decodedToken.permission!=="admin")
    {
        const error =  new Error("Not authenticated");
        error.statusCode=401;
        throw error;
    }
    next();
}

module.exports= isAuth;
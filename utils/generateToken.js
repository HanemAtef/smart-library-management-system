//generate JWT token
const JWT=require('jsonwebtoken');
const generateToken=(id)=>{
return JWT.sign({id},process.env.JWT_SECRET,{ expiresIn:'14d'})
}   
module.exports=generateToken;
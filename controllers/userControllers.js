const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
/* register user */
const registerUser = async (req, res) => {
    try{
        //get data from request body
        const {email,name,password}=req.body;
        const userExist=await User.findOne({email});
        //check if user exist
        if(userExist){
            return res.status(400).json({msg:"User already exist"});
        }
//hash password
        const hashedPassword=await bcrypt.hash(password,10);
        //create user 
        const user=await User.create({
            name,
            email,
            password:hashedPassword,
        })
        //response
        res.status(201).json({
            msg:"User created successfully",
            success:true,
            data:user,
            token:generateToken(user._id),
        })

}
    catch(err){
        console.log(err);
        res.status(500).json({msg:"Server error"});
    }
}

/* login user */
const loginUser=async(req,res)=>{
    try{
        //get data
        const {email,password}=req.body;
        //find user by email
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({msg:"User not found"});
        }

        //compare password
        const ismatch=await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.status(400).json({msg:"Invalid password"});
        }
        //response
        res.status(200).json({
            msg:"User logged in successfully",
            success:true,
            data:user,
            token:generateToken(user._id),
        })  
    }
    catch(err){ 
        console.log(err);
        res.status(500).json({msg:"Server error"}); 
    }
};
/*get user profile*/
const getMe=async(req,res)=>{
    try{
        const user=req.user;
        res.status(200).json({
            msg:"User profile",
            success:true,
            data:user,
        })  }
        catch(err){
            console.log(err);
            res.status(500).json({msg:"Server error"});
        }       
    }
module.exports={registerUser,loginUser,getMe};
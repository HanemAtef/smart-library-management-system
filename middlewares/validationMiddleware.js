const validate=(schema) => {
    return (req,res,next)=>{
        const {error}=schema.validate(req.body);
        if(error){
            return res.status(400).json({msg: error});
        }   
        next();
    }
}


module.exports=validate;
const JOI=require('joi');
const registerSchema=JOI.object({
    name:JOI.string().min(2).max(50).required(),
    email:JOI.string().email().required(),
    password:JOI.string().min(6).required(),
    role: JOI.string().valid("admin","user").default("user")

});

module.exports=registerSchema;
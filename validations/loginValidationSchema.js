const JOI=require('joi');

const loginSchema=JOI.object({
    email:JOI.string().email().required(),
    password:JOI.string().min(6).required(),
});
module.exports=loginSchema;
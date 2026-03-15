const JWT = require('jsonwebtoken');
const User = require('../models/User');

// Middleware
const authMiddleware = async (req, res, next) => {
    try {
      // get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: "no token" })
        }
        //split token
        
        const token = authHeader.split(' ')[1];
        //verify token
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        //find user by id
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ msg: "invalid token" })

        }
        //attach user to request 
        req.user = user; 
        next();
    }
    catch (err) {

  console.log(err);
  return res.status(401).json({ msg: "Invalid token" });

    }
}
//allowed user role 
const allowedToMiddleware = (...roles) => {
  
  // console.log(roles);
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role ${req.user.role} not authorized` 
      });
    }
    next();
  };
};

module.exports = { authMiddleware, allowedToMiddleware };
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,         
    trim: true,                        
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum:["admin", "user"],
    default: 'user'
  },
  borrowLimit: {
    type: Number,
    default: 3,
    min: 1,
    max: 3,
  }
}, {
  timestamps: true,                    
});

// Create the User model & export it
const User = mongoose.model('User', userSchema);
module.exports = User;
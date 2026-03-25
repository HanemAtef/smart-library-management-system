const Joi = require("joi");

const addReviewSchema = Joi.object({
  rating: Joi.number().required().min(1).max(5),
  comment: Joi.string().required().min(3).max(500),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number().min(1).max(5),
  comment: Joi.string().min(3).max(500),
}).min(1); 
module.exports = { addReviewSchema, updateReviewSchema };

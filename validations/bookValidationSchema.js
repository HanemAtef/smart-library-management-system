const Joi = require('joi');
const createBookValidation =Joi.object({
title:Joi.string().required(),
author:Joi.string().required(),
genre:Joi.string().valid('Fiction','Horror', 'Science', 'History', 'Technology', 'Other').required(),
description:Joi.string().default("no description"),
totalCopies:Joi.number().required().min(0).default(1),
availableCopies:Joi.number().min(0),
coverImage: Joi.string().optional()
});

const updateBookValidation =Joi.object({
title:Joi.string().optional(),
author:Joi.string().optional(),
genre:Joi.string().valid('Fiction','Horror', 'Science', 'History', 'Technology', 'Other').optional(),       
description:Joi.string().optional(),
totalCopies:Joi.number().min(0).optional(),
availableCopies:Joi.number().min(0).optional(),
coverImage: Joi.string().optional()
});

module.exports = {
    createBookValidation,
    updateBookValidation
}
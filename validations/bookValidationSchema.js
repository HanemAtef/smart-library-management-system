const Joi = require('joi');
const joi=require('joi');
const createBookValidation =joi.object({
title:joi.string().required(),
author:joi.string().required(),
genre:joi.string().valid('Fiction','Horror', 'Science', 'History', 'Technology', 'Other').required(),
description:joi.string().default("no description"),
totalCopies:joi.number().required().min(0).default(1),
availableCopies:joi.number().min(0),
coverImage: Joi.string().optional()
});

const updateBookValidation =joi.object({
title:joi.string().optional(),
author:joi.string().optional(),
genre:joi.string().valid('Fiction','Horror', 'Science', 'History', 'Technology', 'Other').optional(),       
description:joi.string().optional(),
totalCopies:joi.number().min(0).optional(),
availableCopies:joi.number().min(0).optional(),
coverImage: Joi.string().optional()
});

module.exports = {
    createBookValidation,
    updateBookValidation
}
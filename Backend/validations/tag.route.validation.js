const Joi = require('joi');

const uuidSchema = Joi.string().uuid({ version: ['uuidv4'] }); // Not interested with v5
// Validation schema for the 'createdBy' query parameter
const createdByQuerySchema = Joi.object({
    createdBy: Joi.string().trim().required().messages({
        'any.required': 'createdBy is required',
        'string.empty': 'createdBy cannot be empty'
    })
});
// create tag input validation schema
const createTagInputBodySchema = Joi.object({
    createdBy: Joi.string().trim().required(),
    patternRaw: Joi.string().trim().min(1).required(),
    tagsPageId: uuidSchema.allow(null, '').optional()
});
// To remove a specific tag input, we just need the tag input ID in the URL params
const removeTagInputParamsSchema = Joi.object({
    id: uuidSchema.required()
});
// This is for the endpoint that clears all tag inputs for a user, so we just need the user ID
const clearAllTagInputParamsSchema = Joi.object({
    id: Joi.string().trim().required()
});
// For creating a tag page
const createTagPageBodySchema = Joi.object({
    name: Joi.string().trim().min(1).required(),
    createdBy: Joi.string().trim().required(),
    order: Joi.number().integer().min(1).default(1)
});
// For updating a tag page, we need the page ID in the URL params, and in the body we can have an optional name and/or order to update
const updateTagPageParamsSchema = Joi.object({
    id: uuidSchema.required()
});
// For updating a tag page, we allow updating the name and/or order, but at least one must be provided
const updateTagPageBodySchema = Joi.object({
    name: Joi.string().trim().min(1).optional(),
    order: Joi.number().integer().min(1).optional()
}).or('name', 'order');

const removeTagPageParamsSchema = Joi.object({
    id: uuidSchema.required()
});
// Generic validation middleware that takes another function to validate a specific part of the request (body, query, params)
const validate = (schema, source = 'body') => (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
        abortEarly: false,
        convert: true,
        stripUnknown: true
    });
    if (error) {
        return res.status(400).json({
            ok: false,
            error: 'Validation failed',
            details: error.details.map(d => d.message)
        });
    };
    req[source] = value;
    next();
};

const validateBody = (schema) => validate(schema, 'body');
const validateQuery = (schema) => validate(schema, 'query');
const validateParams = (schema) => validate(schema, 'params');

module.exports = {
    createdByQuerySchema,
    createTagInputBodySchema,
    removeTagInputParamsSchema,
    clearAllTagInputParamsSchema,
    createTagPageBodySchema,
    updateTagPageParamsSchema,
    updateTagPageBodySchema,
    removeTagPageParamsSchema,
    validateBody,
    validateQuery,
    validateParams
};
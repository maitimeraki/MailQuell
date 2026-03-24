const Joi = require('joi');

// -- Processed Mail Stats Schema --
const processedMailStatsQuerySchema = Joi.object({
  createdBy: Joi.string().trim().required().messages({
    'any.required': 'createdBy is required',
    'string.empty': 'createdBy cannot be empty'
  })
});

 // -- MailActivity Schema --
const mailActivityQuerySchema = Joi.object({
  createdBy: Joi.string().trim().allow('').optional(),
  limit: Joi.number().integer().min(1).max(2000).default(200)
});


const validateDatafetchRouteQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    convert: true,       // converts "10" -> 10
    stripUnknown: true   // removes unknown query params
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      error: 'Validation failed',
      details: error.details.map((d) => d.message)
    });
  }

  req.query = value;
  next();
};


module.exports = {
  validateDatafetchRouteQuery,
  processedMailStatsQuerySchema,
  mailActivityQuerySchema
};
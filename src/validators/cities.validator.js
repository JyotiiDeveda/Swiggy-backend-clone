const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');

const validateCity = (req, res, next) => {
  try {
    const schema = Joi.object({
      city: Joi.string()
        .pattern(/^(?:[A-Z][a-z]*)(?: [A-Z][a-z]*)*$/, 'capitalized words')
        .required()
        .messages({
          'string.empty': 'City name is required.',
          'string.pattern.name': 'City name must have the first letter of each word capitalized.',
        }),
    });

    const validateResponse = validateHelper.validateSchemas(schema, req.body);
    const isValid = validateResponse[0];
    const value = validateResponse[1];

    if (!isValid) {
      return commonHelper.customErrorHandler(res, value, 422);
    }

    req.body = value;

    return next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = { validateCity };
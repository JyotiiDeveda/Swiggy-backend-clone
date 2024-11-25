const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validateRestaurantSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().min(3),
      description: Joi.string().required().min(10),
      category: Joi.string()
        .required()
        .valid(...Object.values(constants.RESTAURANT_CATEGORY)),
      address: Joi.object(),
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

module.exports = {
  validateRestaurantSchema,
};

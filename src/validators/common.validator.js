const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validateQueryParams = (req, res, next) => {
  try {
    const schema = Joi.object({
      page: Joi.number().positive().max(100).default(1),
      limit: Joi.number().positive().min(1).max(100).default(10),
      city: Joi.string().optional(),
      sortBy: Joi.string().valid('price', 'avg_rating').optional(),
      role: Joi.string().valid('admin', 'delivery-partner', 'customer').optional(),
      orderBy: Joi.string()
        .valid(...Object.values(constants.SORT_ORDER))
        .optional(),
      name: Joi.string().optional(),
      category: Joi.string()
        .valid(...Object.values(constants.DISH_CATEGORY))
        .optional(),
    });

    const validateResponse = validateHelper.validateSchemas(schema, req.body);
    const isValid = validateResponse[0];
    const value = validateResponse[1];

    if (!isValid) {
      return commonHelper.customErrorHandler(res, value, 422);
    }

    req.query = value;

    return next();
  } catch (err) {
    console.log('Error validating dish input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  validateQueryParams,
};

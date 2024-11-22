const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
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

    const { error, value } = schema.validate(req.query);

    if (error) {
      console.log('error: ', error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Query schema data validation failed';

      return commonHelper.customErrorHandler(res, errMsg, 422);
    }

    req.query = value; // Update query object with validated values
    next();
  } catch (err) {
    console.log('Error validating dish input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  validateQueryParams,
};

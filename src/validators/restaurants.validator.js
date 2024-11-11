const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const constants = require('../constants/constants');

const validateRestaurantSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().min(3),
      description: Joi.string().required().min(10),
      image: Joi.string().required(),
      category: Joi.string()
        .required()
        .valid(...constants.RESTAURANT_CATEGORY),
      address: Joi.object(),
    });

    console.log('Validated Restaurant schema');
    const { error, value } = schema.validate(req.body);
    // console.log("Value in validate: ", value);

    if (error) {
      console.log('error: ', typeof error);
      const errMsg =
        error.details.map(detail => detail.message).join(', ') || 'Restaurant data validation failed';

      return commonHelper.customErrorHandler(res, errMsg, 400);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  validateRestaurantSchema,
};
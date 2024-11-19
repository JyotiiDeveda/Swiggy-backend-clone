const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const constants = require('../constants/constants');

const validateDishSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required().min(3),
      description: Joi.string().required().min(10),
      category: Joi.string()
        .required()
        .valid(...Object.values(constants.DISH_CATEGORY)),
      price: Joi.number().precision(2).options({ convert: false }).required(),
      quantity: Joi.number().options({ convert: false }).required(),
    });

    const { error, value } = schema.validate(req.body);
    // console.log("Value in validate: ", value);

    if (error) {
      console.log('error: ', typeof error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Dish data validation failed';

      return commonHelper.customErrorHandler(res, errMsg, 422);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating dish input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  validateDishSchema,
};

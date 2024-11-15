const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');

const validateCartItemSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      dish_id: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
      quantity: Joi.number().required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log(error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Cart item validation failed';

      return commonHelper.customErrorHandler(res, errMsg, 422);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  validateCartItemSchema,
};

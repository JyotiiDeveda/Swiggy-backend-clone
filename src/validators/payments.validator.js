const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validatePaymentsSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      orderId: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
      type: Joi.string()
        .valid(...Object.values(constants.PAYMENT_TYPE))
        .default(constants.PAYMENT_TYPE.ONLINE),
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
  validatePaymentsSchema,
};
const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validatePlaceOrderSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      cart_id: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
      restaurant_id: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
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

const validateDeliveryPartnerId = (req, res, next) => {
  try {
    const schema = Joi.object({
      userId: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
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

const validateOrderStatus = (req, res, next) => {
  try {
    const schema = Joi.object({
      status: Joi.string()
        .required()
        .valid(...Object.values(constants.ORDER_STATUS)),
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
  validatePlaceOrderSchema,
  validateDeliveryPartnerId,
  validateOrderStatus,
};

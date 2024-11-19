const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
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

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log(error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Input fields validation failed for placing order';

      return commonHelper.customErrorHandler(res, errMsg, 422);
    }

    req.body = value;
    next();
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

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log(error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Delivery partner id validation failed';

      return commonHelper.customErrorHandler(res, errMsg, 422);
    }

    req.body = value;
    next();
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

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log(error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Delivery partner id validation failed';

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
  validatePlaceOrderSchema,
  validateDeliveryPartnerId,
  validateOrderStatus,
};

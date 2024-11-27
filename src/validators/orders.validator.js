const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validatePlaceOrderSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      cartId: Joi.string()
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

const validateQueryParams = (req, res, next) => {
  try {
    const schema = Joi.object({
      sortBy: Joi.string()
        .valid(...Object.values(constants.SORT_ORDERS_BY))
        .default(constants.SORT_ORDERS_BY.CREATED_AT),
      orderBy: Joi.string()
        .valid(...Object.values(constants.SORT_ORDER))
        .default(constants.SORT_ORDER.DESC),
      limit: Joi.number().positive().min(1).max(100).default(10),
      page: Joi.number().positive().min(1).max(100).default(1),
      status: Joi.string()
        .valid(...Object.values(constants.ORDER_STATUS))
        .optional(),
      restaurantId: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .optional(),
    });

    const validateResponse = validateHelper.validateSchemas(schema, req.query);
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
  validatePlaceOrderSchema,
  validateOrderStatus,
  validateQueryParams,
};

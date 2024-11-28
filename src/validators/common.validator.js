const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validateQueryParams = (req, res, next) => {
  try {
    const schema = Joi.object({
      page: Joi.number().positive().max(100).default(1),
      limit: Joi.number().positive().min(1).max(100).default(10),
      cityId: Joi.string().optional(),
      sortBy: Joi.string()
        .valid(...Object.values(constants.SORT_BY))
        .optional(),
      role: Joi.string().valid('admin', 'delivery-partner', 'customer').optional(),
      orderBy: Joi.string()
        .valid(...Object.values(constants.SORT_ORDER))
        .default(constants.SORT_ORDER.ASC),
      name: Joi.string().optional(),
      category: Joi.string()
        .valid(...Object.values(constants.DISH_CATEGORY))
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

const validateId = (req, res, next) => {
  try {
    const id = [...Object.keys(req.body)][0];

    const schema = Joi.object({
      [id]: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
    });

    const payload = req.body;
    const validateResponse = validateHelper.validateSchemas(schema, payload);

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

const validateImageUploadSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      image: Joi.binary().required(),
      entityType: Joi.string()
        .required()
        .valid(...Object.values(constants.ENTITY_TYPE)),
      entityId: Joi.string()
        .guid({
          version: 'uuidv4',
        })
        .required(),
    });

    const payload = {
      image: req.file.buffer,
      entityType: req.body?.entityType,
      entityId: req.body?.entityId,
    };

    const validateResponse = validateHelper.validateSchemas(schema, payload);
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
  validateQueryParams,
  validateId,
  validateImageUploadSchema,
};

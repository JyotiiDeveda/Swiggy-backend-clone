const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');

const validateSignupPayload = (req, res, next) => {
  try {
    const schema = Joi.object({
      first_name: Joi.string().required().min(3),
      last_name: Joi.string().required().min(3),
      email: Joi.string()
        .required()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'co', 'net'] },
        }),
      phone: Joi.string().required().min(10).max(15),
      address: Joi.string().min(5),
    });

    const { error, value } = schema.validate(req.body);
    // console.log("Value in validate: ", value);

    if (error) {
      console.log('error: ', typeof error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Otp Validation failed';

      return commonHelper.customErrorHandler(res, errMsg, 400);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const validateEmail = (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'co', 'net'] },
        }),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      console.log('error: ', error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Otp Validation failed';
      return commonHelper.customErrorHandler(res, errMsg, 400);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const validateLoginSchema = (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string()
        .required()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'co', 'net'] },
        }),
      otp: Joi.string().required().min(6),
    });

    const { value, error } = schema.validate(req.body);

    if (error) {
      console.log('error: ', error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Otp Validation failed';
      return commonHelper.customErrorHandler(res, errMsg, 400);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = { validateSignupPayload, validateEmail, validateLoginSchema };

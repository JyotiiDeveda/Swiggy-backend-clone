const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');

const validateUserAddress = (req, res, next) => {
  try {
    const schema = Joi.object({
      address: Joi.string().required(),
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      console.log('error: ', error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'User address failed';
      return commonHelper.customErrorHandler(res, errMsg, 400);
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = { validateUserAddress };

const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');

const validateRatingScore = (req, res, next) => {
  try {
    const schema = Joi.object({
      rating: Joi.number().required().min(1).max(5),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      console.log(error);
      const errMsg =
        error.details
          .map(detail => detail.message)
          .join(', ')
          .replaceAll(`"`, '') || 'Rating score validation failed';

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
  validateRatingScore,
};

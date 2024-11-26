const Joi = require('joi');
const commonHelper = require('../helpers/common.helper');
const validateHelper = require('../helpers/validate.helper');
const constants = require('../constants/constants');

const validateUser = (req, res, next) => {
  try {
    const schema = Joi.object({
      firstName: Joi.string().required().min(3),
      lastName: Joi.string().required().min(3),
      email: Joi.string()
        .required()
        .email({
          minDomainSegments: 2,
          tlds: { allow: ['com', 'co', 'net'] },
        }),
      phone: Joi.string().required().min(10).max(15),
      address: Joi.string().min(5),
      role: Joi.string()
        .valid(...Object.values(constants.ROLES))
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

// const validateUserAddress = (req, res, next) => {
//   try {
//     const schema = Joi.object({
//       address: Joi.string().required(),
//     });

//     const validateResponse = validateHelper.validateSchemas(schema, req.body);
//     const isValid = validateResponse[0];
//     const value = validateResponse[1];

//     if (!isValid) {
//       return commonHelper.customErrorHandler(res, value, 422);
//     }

//     req.body = value;
//     return next();
//   } catch (err) {
//     console.log('Error validating input fields: ', err);
//     return commonHelper.customErrorHandler(res, err.message, 400);
//   }
// };

module.exports = {
  validateUser,
  // validateUserAddress
};

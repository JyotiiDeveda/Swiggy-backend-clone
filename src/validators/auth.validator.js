const Joi = require('joi');

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
      const errMsg = error?.details[0]?.message.replaceAll('"', '') || 'Validation failed';
      return res.status(400).json({
        success: false,
        error: errMsg,
      });
    }

    req.body = value;
    next();
  } catch (err) {
    console.log('Error validating input fields: ', err);
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { validateSignupPayload };

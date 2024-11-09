const authServices = require('../services/auth.service');
const commonHelper = require('../helpers/common.helper');

const signup = async (req, res) => {
  try {
    const payload = req.body;

    const user = await authServices.signup(payload);
    console.log('New user: ', user);

    if (!user) {
      throw commonHelper.customError('Failed to create user', 400);
    }

    return commonHelper.customResponseHandler(res, 'User created successfully', 201, user);
  } catch (err) {
    console.log('Error in signup', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const sendOtp = async (req, res) => {
  try {
    //get email
    const { email } = req.body;

    const otp = await authServices.sendOtp(email);
    console.log('OTP in controller: ', otp);
    // save to redis
    res.status(200).json({
      success: true,
      message: 'otp sent Successfully',
      otp,
    });

    // send mail
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = { signup, sendOtp };

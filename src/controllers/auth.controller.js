const authServices = require('../services/auth.service');
const commonHelper = require('../helpers/common.helper');

const signup = async (req, res, next) => {
  try {
    const payload = req.body;

    const user = await authServices.signup(payload);
    if (!user) {
      throw commonHelper.customError('Failed to create user', 400);
    }

    res.statusCode = 201;
    res.data = user;
    res.message = 'User created successfully';
    next();
  } catch (err) {
    console.log('Error in signup', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const otp = await authServices.sendOtp(email);

    res.statusCode = 200;
    res.message = 'Otp sent Successfully';
    res.data = otp;

    next();
  } catch (err) {
    console.log(err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const token = await authServices.verifyOtp(email, otp);

    res.statusCode = 200;
    res.message = 'Login Successfully';
    res.data = token;

    next();
  } catch (err) {
    console.log(err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const logout = async (req, res, next) => {
  try {
    // logout logic
    const token = req.user;
    const response = await authServices.logout(token);

    res.statusCode = 200;
    res.message = 'Logout Successfully';
    res.data = response;

    return next();
  } catch (err) {
    console.log('Error in logout: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { signup, sendOtp, login, logout };

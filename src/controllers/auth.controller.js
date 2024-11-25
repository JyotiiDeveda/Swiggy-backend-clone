const authServices = require('../services/auth.service');
const commonHelper = require('../helpers/common.helper');

const signup = async (req, res, next) => {
  try {
    const payload = req.body;

    await authServices.signup(payload);

    res.statusCode = 201;
    res.message = 'User registered successfully';

    next();
  } catch (err) {
    console.log('Error in signup', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authServices.sendOtp(email);

    res.statusCode = 200;
    res.message = 'Otp sent successfully';

    next();
  } catch (err) {
    console.log('Error in sending otp: ', err);
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
    console.log('Error in login: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const logout = async (req, res, next) => {
  try {
    // logout logic
    const token = req.user;
    await authServices.logout(token);

    res.statusCode = 200;
    res.message = 'Logout successful';

    return next();
  } catch (err) {
    console.log('Error in logout: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { signup, sendOtp, login, logout };

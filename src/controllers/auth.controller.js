const authServices = require('../services/auth.service');
const commonHelper = require('../helpers/common.helper');

const signup = async (req, res) => {
  try {
    const payload = req.body;

    const user = await authServices.signup(payload);
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
    const { email } = req.body;

    const otp = await authServices.sendOtp(email);

    return commonHelper.customResponseHandler(res, 'Otp sent Successfully', 200, otp);
  } catch (err) {
    console.log(err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode || 400);
  }
};

const login = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const token = await authServices.verifyOtp(email, otp);

    return commonHelper.customResponseHandler(res, 'Login Successfully', 200, token);
  } catch (err) {
    console.log(err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode || 400);
  }
};

const logout = async (req, res) => {
  try {
    // logout logic
    const token = req.user;
    const response = await authServices.logout(token);
    return commonHelper.customResponseHandler(res, 'Logout Successfully', 200, response);
  } catch (err) {
    console.log('Error in logout: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode || 400);
  }
};

module.exports = { signup, sendOtp, login, logout };

const { redisClient } = require('../config/redis');
const { User, Role } = require('../models');
const userServices = require('./users.service');
const otpHelper = require('../helpers/otp.helper');
const mailHelper = require('../helpers/mail.helper');
const commonHelper = require('../helpers/common.helper');
const jwt = require('jsonwebtoken');

const generateToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};

const verifyToken = token => {
  console.log('JWT SECRET: ', process.env.JWT_SECRET);
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken;
};

const signup = async data => {
  const createdUser = await userServices.create(data);
  // console.log('Created user: ', createdUser);

  const otp = otpHelper.generateOTP();

  await redisClient.set(createdUser.id.toString(), otp.toString(), { EX: 300 });

  await mailHelper.sendVerificationEmail(
    createdUser.email,
    'OTP Verification email',
    `Your one time password to login : ${otp}`
  );

  return;
};

const sendOtp = async email => {
  const userExists = await User.findOne({ where: { email } });

  if (!userExists) {
    throw commonHelper.customError('User does not exist, Please signup', 404);
  }

  // generate otp
  const otp = otpHelper.generateOTP();

  await redisClient.set(userExists?.id.toString(), otp.toString(), { EX: 300 });

  // send mail
  await mailHelper.sendVerificationEmail(email, 'Login OTP', `Your one time password to login: ${otp}`);
  console.log('OTP: ', otp);

  return;
};

const verifyOtp = async (email, otp) => {
  // get user along with its roles
  const userDetails = await User.findOne({
    where: { email },
    include: {
      model: Role,
      as: 'roles',
      attributes: ['name'],
      through: {
        attributes: [], // don't need any of the junction table attributes
      },
    },
  });

  if (!userDetails) {
    throw commonHelper.customError('User not found', 404);
  }

  const key = userDetails?.id.toString();

  const savedOtp = await redisClient.get(key);
  // console.log('Saved otp: ', savedOtp);

  if (savedOtp !== otp) {
    throw commonHelper.customError('Invalid otp', 401);
  }

  const rolesObj = userDetails.roles;
  const userRoles = [];
  rolesObj.forEach(role => userRoles.push(role.name));

  //delete otp once verified
  await redisClient.del(key);

  const payload = {
    userId: userDetails.id,
    userRoles,
    email,
  };

  const token = generateToken(payload);

  return { token };
};

const logout = async () => {
  return {};
};

module.exports = { signup, sendOtp, verifyOtp, logout, generateToken, verifyToken };

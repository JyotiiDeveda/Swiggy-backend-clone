const userServices = require('./users.service');
const otpHelper = require('../helpers/otp.helper');
const mailHelper = require('../helpers/mail.helper');
const commonHelper = require('../helpers/common.helper');
const { redisClient } = require('../config/redis');
const models = require('../models');

const signup = async data => {
  const createdUser = await userServices.create(data);
  console.log('Created user: ', createdUser);

  const otp = otpHelper.generateOTP();

  await redisClient.set(createdUser.id.toString(), otp.toString(), { EX: 200 });

  await mailHelper.sendVerificationEmail(createdUser.email, otp);

  return createdUser;
};

const sendOtp = async email => {
  const userExists = await models.User.findOne({ where: { email } });
  console.log('userExists: ', userExists);

  if (!userExists) {
    throw commonHelper.customError('User does not exist.. Please signup', 404);
  }

  // generate otp
  const otp = otpHelper.generateOTP();

  await redisClient.set(userExists?.id.toString(), otp.toString(), { EX: 200 });

  // send mail
  await mailHelper.sendVerificationEmail(email, otp);

  return otp;
};

module.exports = { signup, sendOtp };

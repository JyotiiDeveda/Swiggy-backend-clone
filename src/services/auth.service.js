const userServices = require('./users.service');
const otpHelper = require('../helpers/otp.helper');
const mailHelper = require('../helpers/mail.helper');
const { redisClient } = require('../config/redis');

const signup = async data => {
  const createdUser = await userServices.create(data);
  console.log('Created user: ', createdUser);

  const otp = otpHelper.generateOTP();

  await redisClient.set(createdUser.id.toString(), otp.toString(), { EX: 200 });

  await mailHelper.sendVerificationEmail(createdUser.email, otp);

  return createdUser;
};

module.exports = { signup };

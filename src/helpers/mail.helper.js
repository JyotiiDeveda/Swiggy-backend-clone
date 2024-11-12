const { mailSender } = require('../utils/mail-sender.js');
const commonHelpers = require('./common.helper.js');

const sendVerificationEmail = async (email, otp) => {
  try {
    const mailResponse = await mailSender(
      email,
      'OTP Verification email',
      `Please confirm your OTP
      	Here is your OTP code: ${otp}`
    );
    console.log('Email sent successfully: ', mailResponse);
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

module.exports = { sendVerificationEmail };

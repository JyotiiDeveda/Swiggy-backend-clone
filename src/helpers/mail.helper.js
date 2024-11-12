const { mailSender } = require('../utils/mail-sender.js');
const commonHelpers = require('./common.helper.js');

const sendVerificationEmail = async (email, title, body) => {
  try {
    await mailSender(email, title, body);
    console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

module.exports = { sendVerificationEmail };

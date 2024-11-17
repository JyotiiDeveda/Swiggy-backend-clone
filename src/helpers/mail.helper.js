const commonHelpers = require('./common.helper.js');
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // console.log('Created transporter: ');
  const mailOptions = {
    from: process.env.EMAIL || 'Jyoti Deveda',
    to: email,
    subject: title,
    text: body,
  };

  const info = await transporter.sendMail(mailOptions);
  // console.log('Mail info: ', info);
  return info;
};

const sendVerificationEmail = async (email, title, body) => {
  try {
    await mailSender(email, title, body);
    // console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

module.exports = { sendVerificationEmail };

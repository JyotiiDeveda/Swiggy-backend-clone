const otpGenerator = require('otp-generator');

const generateOTP = () => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: true,
    lowerCaseAlphabets: true,
    specialChars: false,
  });
  console.log('OTP in helper: ', otp);

  return otp;
};

module.exports = { generateOTP };

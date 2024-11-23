const otpGenerator = require('otp-generator');

const generateOTP = () => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  console.log('OTP in helper: ', otp);

  return otp;
};

module.exports = { generateOTP };

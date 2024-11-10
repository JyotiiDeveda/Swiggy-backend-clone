const jwt = require('jsonwebtoken');

const generateToken = payload => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });

  return token;
};

const verifyToken = token => {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken;
};

module.exports = {
  generateToken,
  verifyToken,
};

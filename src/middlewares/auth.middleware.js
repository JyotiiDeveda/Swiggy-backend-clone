const commonHelper = require('../helpers/common.helper');
const jwtHelper = require('../helpers/jwt.helper');
const models = require('../models');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    // console.log("Token: ", token);

    if (!token) {
      throw commonHelper.customErrorHandler(res, 'Token not found', 401);
    }

    const decode = jwtHelper.verifyToken(token);
    console.log('Decode: ', decode);

    // check if user exists
    const userDetails = await models.User.findByPk(decode.userId);

    if (!userDetails) {
      throw commonHelper.customError(res, 'User does not exists', 404);
    }

    req.user = decode;
    next();
  } catch (err) {
    console.log('Error: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 401);
  }
};

const isAuthorized = (req, res, next) => {
  try {
    const userRoles = req?.user?.userRoles;
    console.log('User roles: ', req.user);
    if (userRoles && (userRoles.includes('Customer') || userRoles.includes('Admin'))) {
      return next();
    }
    return commonHelper.customErrorHandler(res, 'User is not authorized', 403);
  } catch (err) {
    console.log('Error in authorizing: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 401);
  }
};

module.exports = { authenticateToken, isAuthorized };

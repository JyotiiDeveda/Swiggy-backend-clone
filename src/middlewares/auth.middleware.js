const commonHelper = require('../helpers/common.helper');
const jwtHelper = require('../helpers/jwt.helper');
const models = require('../models');
const constants = require('../constants/constants');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return commonHelper.customErrorHandler(res, 'Token not found', 401);
    }

    const decode = jwtHelper.verifyToken(token);

    // check if user exists
    const userDetails = await models.User.findByPk(decode.userId);

    if (!userDetails) {
      return commonHelper.customErrorHandler(res, 'User does not exists', 404);
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
    if (
      userRoles &&
      (userRoles.includes(constants.ROLES.ADMIN) || userRoles.includes(constants.ROLES.CUSTOMER))
    ) {
      return next();
    }
    return commonHelper.customErrorHandler(res, 'Admin or authorized user can access this route', 403);
  } catch (err) {
    console.log('Error in authorizing: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 401);
  }
};

const isAdmin = (req, res, next) => {
  try {
    const userRoles = req?.user?.userRoles;
    if (userRoles && userRoles.includes(constants.ROLES.ADMIN)) {
      return next();
    }
    return commonHelper.customErrorHandler(res, 'User is not authorized.', 403);
  } catch (err) {
    console.log('Error in authorizing customer: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 401);
  }
};

const isAuthorizedDeliveryPartner = (req, res, next) => {
  try {
    const userRoles = req?.user?.userRoles;
    if (
      userRoles &&
      (userRoles.includes(constants.ROLES.ADMIN) || userRoles.includes(constants.ROLES.DELIVERY_PARTNER))
    ) {
      return next();
    }
    return commonHelper.customErrorHandler(
      res,
      'Admin or authorized Delivery partner can access this route.',
      403
    );
  } catch (err) {
    console.log('Error in authorizing Delivery Partner: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 401);
  }
};

module.exports = { authenticateToken, isAuthorized, isAdmin, isAuthorizedDeliveryPartner };

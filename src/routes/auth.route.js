const router = require('express').Router();
const authControllers = require('../controllers/auth.controller');
const authValidators = require('../validators/auth.validator');
const userValidators = require('../validators/users.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');

router.post(
  '/signup',
  userValidators.validateUser,
  authControllers.signup,
  commonHelpers.customResponseHandler
);

router.post(
  '/send-otp',
  authValidators.validateEmail,
  authControllers.sendOtp,
  commonHelpers.customResponseHandler
);

router.post(
  '/login',
  authValidators.validateLoginSchema,
  authControllers.login,
  commonHelpers.customResponseHandler
);

router.delete(
  '/logout',
  authMiddlewares.authenticateToken,
  authControllers.logout,
  commonHelpers.customResponseHandler
);

module.exports = router;

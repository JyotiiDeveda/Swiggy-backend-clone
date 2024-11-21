const router = require('express').Router();
const authControllers = require('../controllers/auth.controller');
const authValidators = require('../validators/auth.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const commonHelpers = require('../helpers/common.helper');
const userSerializers = require('../serializers/users.serializer');

router.post(
  '/signup',
  authValidators.validateSignupPayload,
  authControllers.signup,
  userSerializers.serializeUsers,
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

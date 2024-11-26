const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const paymentsController = require('../controllers/payments.controller');
const commonHelpers = require('../helpers/common.helper');
const paymentSerializers = require('../serializers/payments.serializer');
// const commonValidators = require('../validators/common.validator');
const paymentsValidator = require('../validators/payments.validator');

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  paymentsValidator.validatePaymentsSchema,
  paymentsController.makePayment,
  paymentSerializers.serializePayments,
  commonHelpers.customResponseHandler
);

module.exports = router;

const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const paymentsController = require('../controllers/payments.controller');
const commonHelpers = require('../helpers/common.helper');
const paymentSerializers = require('../serializers/payments.serializer');

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  paymentsController.makePayment,
  paymentSerializers.serializePayments,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  paymentsController.getAll,
  paymentSerializers.serializePayments,
  commonHelpers.customResponseHandler
);

module.exports = router;

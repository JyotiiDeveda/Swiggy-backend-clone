const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const paymentsController = require('../controllers/payments.controller');
const commonHelpers = require('../helpers/common.helper');

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  paymentsController.makePayment,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  paymentsController.getAll,
  commonHelpers.customResponseHandler
);

module.exports = router;

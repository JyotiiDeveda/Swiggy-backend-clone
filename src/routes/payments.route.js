const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const paymentsController = require('../controllers/payments.controller');

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  paymentsController.makePayment
);

module.exports = router;

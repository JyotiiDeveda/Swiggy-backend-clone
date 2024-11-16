const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const orderControllers = require('../controllers/orders.controller');

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderControllers.getAllUnassignedOrders
);

module.exports = router;

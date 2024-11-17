const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const orderControllers = require('../controllers/orders.controller');

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderControllers.getAllUnassignedOrders
);

// assign order to delivery partner
router.patch(
  '/:orderId/users/:userId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderControllers.assignOrder
);

// update order status
router.patch(
  '/:orderId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderControllers.updateOrderStatus
);

module.exports = router;

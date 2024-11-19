const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const orderControllers = require('../controllers/orders.controller');
const orderValidators = require('../validators/orders.validator');

// get all unassigned orders
router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderControllers.getAllUnassignedOrders
);

// assign order to delivery partner
router.patch(
  '/:id/assign-order',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateDeliveryPartnerId,
  orderControllers.assignOrder
);

// update order status
router.patch(
  '/:id/update-status',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateOrderStatus,
  orderControllers.updateOrderStatus
);

module.exports = router;

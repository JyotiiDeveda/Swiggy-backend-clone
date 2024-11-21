const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const orderControllers = require('../controllers/orders.controller');
const orderValidators = require('../validators/orders.validator');
const commonHelpers = require('../helpers/common.helper');
const orderSerializers = require('../serializers/orders.serializer');

// get all unassigned orders
router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderControllers.getAllUnassignedOrders,
  orderSerializers.serializeOrder,
  commonHelpers.customResponseHandler
);

// assign order to delivery partner
router.patch(
  '/:id/assign-order',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateDeliveryPartnerId,
  orderControllers.assignOrder,
  orderSerializers.serializeOrder,
  commonHelpers.customResponseHandler
);

// update order status
router.patch(
  '/:id/update-status',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateOrderStatus,
  orderControllers.updateOrderStatus,
  orderSerializers.serializeOrder,
  commonHelpers.customResponseHandler
);

module.exports = router;

const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const orderControllers = require('../controllers/orders.controller');
const orderValidators = require('../validators/orders.validator');
const commonHelpers = require('../helpers/common.helper');
const orderSerializers = require('../serializers/orders.serializer');
const commonValidators = require('../validators/common.validator');

// get all unassigned orders -- not accessible for customers
router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateQueryParams,
  orderControllers.getAllUnassignedOrders,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

// assign order to delivery partner
router.patch(
  '/:id/assign',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  commonValidators.validateId,
  orderControllers.assignOrder,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

// update order status
router.patch(
  '/:id/status',
  authMiddlewares.authenticateToken,

  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateOrderStatus,
  orderControllers.updateOrderStatus,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

module.exports = router;

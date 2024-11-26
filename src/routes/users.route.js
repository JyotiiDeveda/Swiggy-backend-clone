const router = require('express').Router();
const userControllers = require('../controllers/users.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const orderValidators = require('../validators/orders.validator');
const commonValidators = require('../validators/common.validator');
const userValidators = require('../validators/users.validator');
const userSerializers = require('../serializers/users.serializer');
const orderSerializers = require('../serializers/orders.serializer');
const commonHelpers = require('../helpers/common.helper');

// for admin to create user
router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userValidators.validateUser,
  userControllers.create,
  userSerializers.serializeUsers,
  commonHelpers.customResponseHandler
);

router.put(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userValidators.validateUser,
  userControllers.updateProfile,
  userSerializers.serializeUsers,
  commonHelpers.customResponseHandler
);

// create delivery partner by assigning delvery partner role to customer
router.put(
  '/:userId/assign-role',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  commonValidators.validateId,
  userControllers.assignRole,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.removeAccount,
  commonHelpers.customResponseHandler
);

router.get(
  '/me',
  authMiddlewares.authenticateToken,
  userControllers.get,
  userSerializers.serializeUsers,
  commonHelpers.customResponseHandler
);

router.get(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userControllers.get,
  userSerializers.serializeUsers,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userControllers.getAll,
  userSerializers.serializeUsers,
  commonHelpers.customResponseHandler
);

// user's order related routes
router.post(
  '/:id/orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  orderValidators.validatePlaceOrderSchema,
  userControllers.placeOrder,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

router.get(
  '/:userId/orders/:orderId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.getOrder,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

// get user order history
router.get(
  '/:id/orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  orderValidators.validateQueryParams,
  userControllers.getAllOrders,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

// delete an unsettled order
router.delete(
  '/:userId/orders/:orderId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.deleteOrder,
  commonHelpers.customResponseHandler
);

// delivery partner can get all pending orders
router.get(
  '/:id/pending-orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  orderValidators.validateQueryParams,
  userControllers.getPendingOrders,
  orderSerializers.serializeOrders,
  commonHelpers.customResponseHandler
);

module.exports = router;

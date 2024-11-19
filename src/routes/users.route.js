const router = require('express').Router();
const userControllers = require('../controllers/users.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const orderValidators = require('../validators/orders.validator');
const userValidators = require('../validators/users.validator');

const commonHelpers = require('../helpers/common.helper');

router.patch(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userValidators.validateUserAddress,
  userControllers.addAddress,
  commonHelpers.customResponseHandler
);

// create delivery partner by assigning delvery partner role to customer
router.put(
  '/:userId/roles/:roleId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userControllers.addDeliveryPartner,
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
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.get,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userControllers.getAll,
  commonHelpers.customResponseHandler
);

// user's order related routes
router.post(
  '/:id/orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  orderValidators.validatePlaceOrderSchema,
  userControllers.placeOrder,
  commonHelpers.customResponseHandler
);

router.get(
  '/:userId/orders/:orderId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.getOrder,
  commonHelpers.customResponseHandler
);

// get user order history
router.get(
  '/:id/orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.getAllOrders,
  commonHelpers.customResponseHandler
);

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
  userControllers.getPendingOrders,
  commonHelpers.customResponseHandler
);

module.exports = router;

const router = require('express').Router();
const userControllers = require('../controllers/users.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const orderValidators = require('../validators/orders.validator');
const userValidators = require('../validators/users.validator');

router.patch(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userValidators.validateUserAddress,
  userControllers.addAddress
);

// create delivery partner by assigning delvery partner role to customer
router.put(
  '/:userid/roles/:roleid',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userControllers.addDeliveryPartner
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.removeAccount
);

router.get('/:id', authMiddlewares.authenticateToken, authMiddlewares.isAuthorized, userControllers.get);

router.get('/', authMiddlewares.authenticateToken, authMiddlewares.isAdmin, userControllers.getAll);

// user's order related routes
router.post(
  '/:id/orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  orderValidators.validatePlaceOrderSchema,
  userControllers.placeOrder
);

router.get(
  '/:userId/orders/:orderId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.getOrder
);

// get user order history
router.get(
  '/:id/orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.getAllOrders
);

router.delete(
  '/:userId/orders/:orderId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.deleteOrder
);

// delivery partner can get all pending orders
router.get(
  '/:id/pending-orders',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorizedDeliveryPartner,
  userControllers.getPendingOrders
);

module.exports = router;

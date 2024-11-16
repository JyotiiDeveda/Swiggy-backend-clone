const router = require('express').Router();
const userControllers = require('../controllers/users.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const orderValidators = require('../validators/orders.validator');

router.patch(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.addAddress
);

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

// place order
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

module.exports = router;

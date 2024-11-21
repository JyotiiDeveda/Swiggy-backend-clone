const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const cartControllers = require('../controllers/carts.controller');
const cartValidators = require('../validators/carts.validator');
const commonHelpers = require('../helpers/common.helper');

router.get(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.getCartDishes,
  commonHelpers.customResponseHandler
);

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartValidators.validateCartItemSchema,
  cartControllers.addItem,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:cartId/dishes/:dishId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.removeItem,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.emptyCart,
  commonHelpers.customResponseHandler
);

module.exports = router;

const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const cartControllers = require('../controllers/carts.controller');
const cartValidators = require('../validators/carts.validator');
const commonHelpers = require('../helpers/common.helper');
const cartSerializers = require('../serializers/carts.serializer');

// get cart dishes
router.get(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.getCartDishes,
  cartSerializers.serializeCartDishes,
  commonHelpers.customResponseHandler
);

// add to cart
router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartValidators.validateCartItemSchema,
  cartControllers.addItem,
  commonHelpers.customResponseHandler
);

// remove from cart
router.delete(
  '/:cartId/dishes/:dishId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.removeItem,
  commonHelpers.customResponseHandler
);

// empty cart
router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.emptyCart,
  commonHelpers.customResponseHandler
);

module.exports = router;

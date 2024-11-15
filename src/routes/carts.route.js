const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const cartControllers = require('../controllers/carts.controller');
const cartValidators = require('../validators/carts.validator');

// add item to cart
router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartValidators.validateCartItemSchema,
  cartControllers.addItem
);

router.delete(
  '/:cartId/dishes/:dishId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  cartControllers.removeItem
);

module.exports = router;

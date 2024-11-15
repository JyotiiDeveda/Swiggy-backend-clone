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

module.exports = router;

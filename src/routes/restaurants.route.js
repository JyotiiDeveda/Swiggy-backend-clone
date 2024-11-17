const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');

router.post(
  '/',
  restaurantValidators.validateRestaurantSchema,
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.create
);

router.get('/:id', restaurantsController.get);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.remove
);

module.exports = router;

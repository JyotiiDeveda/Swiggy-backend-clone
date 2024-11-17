const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const dishValidators = require('../validators/dishes.validator');

router.post(
  '/',
  restaurantValidators.validateRestaurantSchema,
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.create
);

router.get('/:id', restaurantsController.get);

//to rate restaurant
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  restaurantsController.createRestaurantsRating
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.remove
);

// to create a dish
router.post(
  '/:id/dishes',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  restaurantsController.createRestaurantsDish
);

module.exports = router;

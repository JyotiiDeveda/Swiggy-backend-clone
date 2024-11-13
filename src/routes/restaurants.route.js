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

module.exports = router;

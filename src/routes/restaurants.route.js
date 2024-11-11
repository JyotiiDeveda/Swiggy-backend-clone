const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const ratingControllers = require('../controllers/ratings.controller');
const dishValidators = require('../validators/dishes.validator');
const dishControllers = require('../controllers/dishes.controller');

router.post(
  '/',
  restaurantValidators.validateRestaurantSchema,
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.create
);

router.get('/:id', restaurantsController.get);

module.exports = router;

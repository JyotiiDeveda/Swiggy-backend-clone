const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const dishValidators = require('../validators/dishes.validator');
const multerMiddleware = require('../middlewares/multer.middleware');
const ratingValidators = require('../validators/ratings.validator');

// to create restaurant
router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantValidators.validateRestaurantSchema,
  restaurantsController.create
);

router.get('/:id', restaurantsController.get);

//to rate restaurant
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  ratingValidators.validateRatingScore,
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
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  restaurantsController.createRestaurantsDish
);

//image upload
router.patch(
  '/:id/images',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  multerMiddleware.upload.single('image'),
  restaurantValidators.validateImage,
  restaurantsController.uploadImage
);

module.exports = router;

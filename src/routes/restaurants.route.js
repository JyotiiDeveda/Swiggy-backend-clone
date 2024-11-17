const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const dishValidators = require('../validators/dishes.validator');
const multerMiddleware = require('../middlewares/multer.middleware');

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

router.patch(
  '/:id/images',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  authMiddlewares.isAdmin,
  multerMiddleware.upload.single('image'),
  restaurantValidators.validateImage,
  restaurantsController.uploadImage
);

module.exports = router;

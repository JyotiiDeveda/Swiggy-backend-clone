const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const dishValidators = require('../validators/dishes.validator');
const upload = require('../middlewares/multer.middleware');
const ratingValidators = require('../validators/ratings.validator');
const commonHelpers = require('../helpers/common.helper');
const dishSerializers = require('../serializers/dishes.serializer');

// to create restaurant
router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantValidators.validateRestaurantSchema,
  restaurantsController.create,
  commonHelpers.customResponseHandler
);

router.get('/', restaurantsController.getAll, commonHelpers.customResponseHandler);

router.get('/:id', restaurantsController.get, commonHelpers.customResponseHandler);

router.put(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantValidators.validateRestaurantSchema,
  restaurantsController.update,
  commonHelpers.customResponseHandler
);

//to rate restaurant
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  ratingValidators.validateRatingScore,
  restaurantsController.createRestaurantsRating,
  commonHelpers.customResponseHandler
);

// delete rating
router.delete(
  '/:restaurantId/ratings/:ratingId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  restaurantsController.deleteRating,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.remove,
  commonHelpers.customResponseHandler
);

//image upload
router.patch(
  '/:id/images',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  restaurantValidators.validateImage,
  restaurantsController.uploadImage,
  commonHelpers.customResponseHandler
);

// dishes routes

// to create a dish
router.post(
  '/:id/dishes',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  restaurantsController.createRestaurantsDish,
  dishSerializers.serializeDishes,
  commonHelpers.customResponseHandler
);

router.get(
  '/:restaurantId/dishes/:dishId',
  restaurantsController.getDish,
  dishSerializers.serializeDishes,
  commonHelpers.customResponseHandler
);

router.get(
  '/:restaurantId/dishes',
  restaurantsController.getAllDishes,
  dishSerializers.serializeDishes,
  commonHelpers.customResponseHandler
);

router.put(
  '/:restaurantId/dishes/:dishId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  restaurantsController.updateDish,
  dishSerializers.serializeDishes,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:restaurantId/dishes/:dishId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantsController.removeDish,
  commonHelpers.customResponseHandler
);

router.patch(
  '/:restaurantId/dishes/:dishId/images',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  restaurantValidators.validateImage,
  restaurantsController.uplaodDishImage,
  dishSerializers.serializeDishes,
  commonHelpers.customResponseHandler
);

module.exports = router;

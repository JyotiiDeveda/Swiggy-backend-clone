const router = require('express').Router();
const restaurantsController = require('../controllers/restaurants.controller.js');
const restaurantValidators = require('../validators/restaurants.validator');
const authMiddlewares = require('../middlewares/auth.middleware');
const dishValidators = require('../validators/dishes.validator');
const upload = require('../middlewares/multer.middleware');
const ratingValidators = require('../validators/ratings.validator');
const commonHelpers = require('../helpers/common.helper');
const dishSerializers = require('../serializers/dishes.serializer');
const restaurantSerializers = require('../serializers/restaurants.serializer');
const ratingSerializers = require('../serializers/ratings.serializer');
const commonValidators = require('../validators/common.validator');

// to create restaurant
router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantValidators.validateRestaurantSchema,
  restaurantsController.create,
  restaurantSerializers.serializeRestaurants,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  commonValidators.validateQueryParams,
  restaurantsController.getAll,
  restaurantSerializers.serializeRestaurants,
  commonHelpers.customResponseHandler
);

router.get(
  '/:id',
  restaurantsController.get,
  restaurantSerializers.serializeRestaurants,
  commonHelpers.customResponseHandler
);

router.put(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  restaurantValidators.validateRestaurantSchema,
  commonValidators.validateQueryParams,
  restaurantsController.update,
  restaurantSerializers.serializeRestaurants,
  commonHelpers.customResponseHandler
);

//to rate restaurant
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  ratingValidators.validateRatingScore,
  restaurantsController.createRestaurantsRating,
  ratingSerializers.serializeRatings,
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
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  restaurantValidators.validateImage,
  restaurantsController.uploadImage,
  restaurantSerializers.serializeRestaurants,
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
  commonValidators.validateQueryParams,
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
  '/:restaurantId/dishes/:dishId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  restaurantValidators.validateImage,
  restaurantsController.uplaodDishImage,
  dishSerializers.serializeDishes,
  commonHelpers.customResponseHandler
);

module.exports = router;

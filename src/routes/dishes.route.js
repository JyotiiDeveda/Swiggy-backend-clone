const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const dishControllers = require('../controllers/dishes.controller');
const dishValidators = require('../validators/dishes.validator');
const upload = require('../middlewares/multer.middleware');
const restaurantValidators = require('../validators/restaurants.validator');
const ratingsValidator = require('../validators/ratings.validator');
const commonHelpers = require('../helpers/common.helper');

// to rate a dish
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  ratingsValidator.validateRatingScore,
  dishControllers.createDishesRating,
  commonHelpers.customResponseHandler
);

// delete rating
router.delete(
  '/:dishId/ratings/:ratingId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  dishControllers.deleteRating,
  commonHelpers.customResponseHandler
);

router.get('/:id', dishControllers.get, commonHelpers.customResponseHandler);

router.get('/', dishControllers.getAll, commonHelpers.customResponseHandler);

router.put(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  dishControllers.update,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  dishControllers.remove,
  commonHelpers.customResponseHandler
);

router.patch(
  '/:id/images',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  restaurantValidators.validateImage,
  dishControllers.uplaodImage,
  commonHelpers.customResponseHandler
);

module.exports = router;

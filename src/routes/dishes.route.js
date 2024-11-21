const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const dishControllers = require('../controllers/dishes.controller');
const ratingsValidator = require('../validators/ratings.validator');
const commonHelpers = require('../helpers/common.helper');
const dishSerializers = require('../serializers/dishes.serializer');

// to rate a dish
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  ratingsValidator.validateRatingScore,
  dishControllers.createDishesRating,
  dishSerializers.serializeDishes,
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

module.exports = router;

const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const dishControllers = require('../controllers/dishes.controller');
const dishValidators = require('../validators/dishes.validator');
const upload = require('../middlewares/multer.middleware');
const restaurantValidators = require('../validators/restaurants.validator');
const ratingsValidator = require('../validators/ratings.validator');

// to rate a dish
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  ratingsValidator.validateRatingScore,
  dishControllers.createDishesRating
);

// delete rating
router.delete(
  '/:dishId/ratings/:ratingId',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  dishControllers.deleteRating
);

router.get('/:id', dishControllers.get);

router.get('/', dishControllers.getAll);

router.put(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  dishControllers.update
);

router.delete('/:id', authMiddlewares.authenticateToken, authMiddlewares.isAdmin, dishControllers.remove);

router.patch(
  '/:id/images',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  restaurantValidators.validateImage,
  dishControllers.uplaodImage
);

module.exports = router;

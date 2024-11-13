const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const dishControllers = require('../controllers/dishes.controller');
const dishValidators = require('../validators/dishes.validator');

// to rate a dish
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  dishControllers.createDishesRating
);

router.get('/:id', dishControllers.get);

router.put(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  authMiddlewares.isAdmin,
  dishValidators.validateDishSchema,
  dishControllers.update
);

module.exports = router;

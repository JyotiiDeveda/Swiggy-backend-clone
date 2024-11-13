const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const dishControllers = require('../controllers/dishes.controller');

// to rate a dish
router.post(
  '/:id/ratings',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  dishControllers.createDishesRating
);

router.get('/:id', dishControllers.get);

module.exports = router;

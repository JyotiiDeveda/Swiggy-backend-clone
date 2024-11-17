const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const ratingControllers = require('../controllers/ratings.controller');

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  ratingControllers.remove
);

module.exports = router;

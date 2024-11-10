const router = require('express').Router();
const userControllers = require('../controllers/users.controller');
const authMiddlewares = require('../middlewares/auth.middleware');

router.patch(
  '/:id/update-address',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  userControllers.addAddress
);

router.put(
  '/:userid/roles/:roleid',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  userControllers.addDeliveryPartner
);

module.exports = router;

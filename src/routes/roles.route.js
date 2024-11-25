const router = require('express').Router();
const rolesController = require('../controllers/roles.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const rolesSerializer = require('../serializers/roles.serializer');
const rolesValidator = require('../validators/roles.validator');
const commonHelpers = require('../helpers/common.helper');

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  rolesValidator.validateRole,
  rolesController.create,
  rolesSerializer.serializeRoles,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAuthorized,
  rolesController.getAll,
  rolesSerializer.serializeRoles,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  rolesController.remove,
  commonHelpers.customResponseHandler
);

module.exports = router;

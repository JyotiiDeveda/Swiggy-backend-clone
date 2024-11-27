const router = require('express').Router();
const citiesController = require('../controllers/cities.controller');
const authMiddlewares = require('../middlewares/auth.middleware');
const citiesSerializer = require('../serializers/cities.serializer');
const citiesValidator = require('../validators/cities.validator');
const commonHelpers = require('../helpers/common.helper');
const commonValidators = require('../validators/common.validator');

router.post(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  citiesValidator.validateCity,
  citiesController.create,
  citiesSerializer.serializeCities,
  commonHelpers.customResponseHandler
);

router.get(
  '/',
  commonValidators.validateQueryParams,
  citiesController.getAll,
  citiesSerializer.serializeCities,
  commonHelpers.customResponseHandler
);

router.delete(
  '/:id',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  citiesController.remove,
  commonHelpers.customResponseHandler
);

module.exports = router;

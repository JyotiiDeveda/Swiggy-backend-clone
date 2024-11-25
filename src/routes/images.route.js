const router = require('express').Router();
const authMiddlewares = require('../middlewares/auth.middleware');
const upload = require('../middlewares/multer.middleware');
const commonHelpers = require('../helpers/common.helper');
const commonValidators = require('../validators/common.validator');
const imagesController = require('../controllers/images.controller');

router.patch(
  '/',
  authMiddlewares.authenticateToken,
  authMiddlewares.isAdmin,
  upload.single('image'),
  commonValidators.validateImageUploadSchema,
  imagesController.uploadImage,
  commonHelpers.customResponseHandler
);

module.exports = router;

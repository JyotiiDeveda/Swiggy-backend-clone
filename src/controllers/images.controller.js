const restaurantServices = require('../services/restaurants.service');
const dishServices = require('../services/dishes.service');
const constants = require('../constants/constants');
const commonHelper = require('../helpers/common.helper');

const uploadImage = async (req, res, next) => {
  try {
    const { entityType, entityId } = req.body;

    let imageData;
    if (entityType === constants.ENTITY_TYPE.DISH) {
      imageData = await dishServices.uploadImage(entityId, req.file);
    } else if (entityType === constants.ENTITY_TYPE.RESTAURANT) {
      imageData = await restaurantServices.uploadImage(entityId, req.file);
    }

    res.statusCode = 200;
    res.message = 'Image uploaded successfully';
    res.data = imageData;

    next();
  } catch (err) {
    console.log('Error in uploading image: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { uploadImage };

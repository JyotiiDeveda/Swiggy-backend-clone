const restaurantServices = require('../services/restaurants.service');
const commonHelper = require('../helpers/common.helper');

const create = async (req, res) => {
  try {
    const payload = req.body;
    const restaurant = await restaurantServices.create(payload);
    return commonHelper.customResponseHandler(res, 'Restaurant created successfully', 201, restaurant);
  } catch (err) {
    console.log('Error in creating restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  create,
};

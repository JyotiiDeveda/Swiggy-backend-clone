const restaurantServices = require('../services/restaurants.service');
const ratingServices = require('../services/ratings.service');
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

const get = async (req, res) => {
  try {
    const restaurantId = req.params['id'];
    const restaurantDetails = await restaurantServices.get(restaurantId);
    return commonHelper.customResponseHandler(res, 'Fetched restaurant successfully', 200, restaurantDetails);
  } catch (err) {
    console.log('Error in getting restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const remove = async (req, res) => {
  try {
    const restaurantId = req.params['id'];
    await restaurantServices.remove(restaurantId);
    return commonHelper.customResponseHandler(res, 'Deleted restaurant successfully', 204);
  } catch (err) {
    console.log('Error in deleting restaurant: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const createRestaurantsRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const entityId = req.params['id'];
    const userId = req.user.userId;
    console.log(`${rating} ${entityId} ${userId}`);
    const newRating = await ratingServices.createRestaurantsRating(entityId, rating, userId);
    console.log('New rating: ', newRating);
    return commonHelper.customResponseHandler(res, 'Restaurant rated successfully', 201, newRating);
  } catch (err) {
    console.log('Error in rating restaurant: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  create,
  get,
  remove,
  createRestaurantsRating,
};

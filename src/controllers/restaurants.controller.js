const restaurantServices = require('../services/restaurants.service');
const ratingServices = require('../services/ratings.service');
const commonHelper = require('../helpers/common.helper');
const dishServices = require('../services/dishes.service');

const create = async (req, res) => {
  try {
    const payload = req.body;
    const restaurant = await restaurantServices.create(payload);
    return commonHelper.customResponseHandler(res, 'Restaurant created successfully', 201, restaurant);
  } catch (err) {
    console.log('Error in creating restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const get = async (req, res) => {
  try {
    const restaurantId = req.params['id'];
    const restaurantDetails = await restaurantServices.get(restaurantId);
    return commonHelper.customResponseHandler(res, 'Fetched restaurant successfully', 200, restaurantDetails);
  } catch (err) {
    console.log('Error in getting restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const remove = async (req, res) => {
  try {
    const restaurantId = req.params['id'];
    await restaurantServices.remove(restaurantId);
    return commonHelper.customResponseHandler(res, 'Deleted restaurant successfully', 204);
  } catch (err) {
    console.log('Error in deleting restaurant: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const createRestaurantsRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const restaurantId = req.params['id'];
    const userId = req.user.userId;
    const newRating = await ratingServices.createRestaurantsRating(restaurantId, rating, userId);
    console.log('New rating: ', newRating);
    return commonHelper.customResponseHandler(res, 'Restaurant rated successfully', 201, newRating);
  } catch (err) {
    console.log('Error in rating restaurant: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const createRestaurantsDish = async (req, res) => {
  try {
    const payload = req.body;
    const restaurantId = req.params['id'];
    const dish = await dishServices.create(restaurantId, payload);
    return commonHelper.customResponseHandler(res, 'Dish created successfully', 201, dish);
  } catch (err) {
    console.log('Error in creating dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const uploadImage = async (req, res) => {
  try {
    const restaurantId = req.params['id'];

    const updatedRestaurant = await restaurantServices.uploadImage(restaurantId, req.file);

    return commonHelper.customResponseHandler(res, 'Image uploaded successfully', 200, updatedRestaurant);
  } catch (err) {
    console.log('Error in uploading image for restaurant: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  create,
  get,
  remove,
  createRestaurantsRating,
  createRestaurantsDish,
  uploadImage,
};

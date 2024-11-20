const restaurantServices = require('../services/restaurants.service');
const ratingServices = require('../services/ratings.service');
const commonHelper = require('../helpers/common.helper');
const dishServices = require('../services/dishes.service');

const create = async (req, res, next) => {
  try {
    const payload = req.body;
    const restaurant = await restaurantServices.create(payload);

    res.statusCode = 201;
    res.message = 'Restaurant created successfully';
    res.data = restaurant;

    next();
  } catch (err) {
    console.log('Error in creating restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const get = async (req, res, next) => {
  try {
    const restaurantId = req.params['id'];
    const restaurantDetails = await restaurantServices.get(restaurantId);

    res.statusCode = 200;
    res.message = 'Fetched restaurant successfully';
    res.data = restaurantDetails;

    next();
  } catch (err) {
    console.log('Error in getting restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res, next) => {
  try {
    const queyOptions = req.query;
    const restaurants = await restaurantServices.getAll(queyOptions);

    res.statusCode = 200;
    res.message = 'Fetched restaurants data successfully';
    res.data = restaurants;

    next();
  } catch (err) {
    console.log('Error in getting all restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const update = async (req, res, next) => {
  try {
    const payload = req.body;
    const restaurantId = req.params['id'];
    const updatedRestaurant = await restaurantServices.update(restaurantId, payload);

    res.statusCode = 200;
    res.message = 'Restaurant updated successfully';
    res.data = updatedRestaurant;

    next();
  } catch (err) {
    console.log('Error in updating restaurant: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const remove = async (req, res, next) => {
  try {
    const restaurantId = req.params['id'];
    await restaurantServices.remove(restaurantId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting restaurant: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const createRestaurantsRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const restaurantId = req.params['id'];
    const userId = req.user.userId;
    const newRating = await ratingServices.createRestaurantsRating(restaurantId, rating, userId);

    res.statusCode = 201;
    res.message = 'Restaurant rated successfully';
    res.data = newRating;

    next();
  } catch (err) {
    console.log('Error in rating restaurant: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const deleteRating = async (req, res, next) => {
  try {
    const restaurantId = req.params['restaurantId'];
    const ratingId = req.params['ratingId'];
    await ratingServices.deleteRestaurantRating(restaurantId, ratingId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting rating: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const createRestaurantsDish = async (req, res, next) => {
  try {
    const payload = req.body;
    const restaurantId = req.params['id'];
    const dish = await dishServices.create(restaurantId, payload);

    res.statusCode = 201;
    res.message = 'Dish created successfully';
    res.data = dish;

    next();
  } catch (err) {
    console.log('Error in creating dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    const restaurantId = req.params['id'];
    const updatedRestaurant = await restaurantServices.uploadImage(restaurantId, req.file);

    res.statusCode = 200;
    res.message = 'Image uploaded successfully';
    res.data = updatedRestaurant;

    next();
  } catch (err) {
    console.log('Error in uploading image for restaurant: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
  createRestaurantsRating,
  deleteRating,
  createRestaurantsDish,
  uploadImage,
};

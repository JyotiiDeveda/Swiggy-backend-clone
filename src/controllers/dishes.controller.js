const ratingServices = require('../services/ratings.service');
const commonHelper = require('../helpers/common.helper');
const dishServices = require('../services/dishes.service');

const createDishesRating = async (req, res) => {
  try {
    const { rating } = req.body;
    const dishId = req.params['id'];
    const userId = req.user.userId;
    const newRating = await ratingServices.createDishesRating(dishId, rating, userId);
    console.log('New rating: ', newRating);
    return commonHelper.customResponseHandler(res, 'Dish rated successfully', 201, newRating);
  } catch (err) {
    console.log('Error in rating dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const get = async (req, res) => {
  try {
    const dishId = req.params['id'];
    const dishDetails = await dishServices.get(dishId);
    return commonHelper.customResponseHandler(res, 'Fetched dish successfully', 200, dishDetails);
  } catch (err) {
    console.log('Error in getting restaurants: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  createDishesRating,
  get,
};

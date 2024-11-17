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
    console.log('Error in getting dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res) => {
  try {
    const queyOptions = req.query;
    const dishes = await dishServices.getAll(queyOptions);
    return commonHelper.customResponseHandler(res, 'Fetched dishes data successfully', 200, dishes);
  } catch (err) {
    console.log('Error in getting all dishes: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const update = async (req, res) => {
  try {
    const payload = req.body;
    const dishId = req.params['id'];
    const updatedDish = await dishServices.update(dishId, payload);
    return commonHelper.customResponseHandler(res, 'Dish updated successfully', 200, updatedDish);
  } catch (err) {
    console.log('Error in updating dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const remove = async (req, res) => {
  try {
    const dishId = req.params['id'];
    await dishServices.remove(dishId);
    return commonHelper.customResponseHandler(res, 'Deleted dish successfully', 204);
  } catch (err) {
    console.log('Error in deleting dish: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const uplaodImage = async (req, res) => {
  try {
    const dishId = req.params['id'];

    const updatedDish = await dishServices.uplaodImage(dishId, req.file);

    return commonHelper.customResponseHandler(res, 'Image uploaded successfully', 200, updatedDish);
  } catch (err) {
    console.log('Error in uploading image for dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  createDishesRating,
  get,
  getAll,
  update,
  remove,
  uplaodImage,
};

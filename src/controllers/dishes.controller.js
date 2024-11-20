const ratingServices = require('../services/ratings.service');
const commonHelper = require('../helpers/common.helper');
const dishServices = require('../services/dishes.service');

const createDishesRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const dishId = req.params['id'];
    const userId = req.user.userId;
    const newRating = await ratingServices.createDishesRating(dishId, rating, userId);
    console.log('New rating: ', newRating);

    res.statusCode = 201;
    res.message = 'Dish rated successfully';
    res.data = newRating;

    next();
  } catch (err) {
    console.log('Error in rating dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const deleteRating = async (req, res, next) => {
  try {
    const dishId = req.params['dishId'];
    const ratingId = req.params['ratingId'];
    await ratingServices.deleteDishRating(dishId, ratingId);

    res.statusCode = 204;
    next();
  } catch (err) {
    console.log('Error in deleting rating: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const get = async (req, res, next) => {
  try {
    const dishId = req.params['id'];
    const dishDetails = await dishServices.get(dishId);

    res.statusCode = 200;
    res.message = 'Fetched dish successfully';
    res.data = dishDetails;

    next();
  } catch (err) {
    console.log('Error in getting dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res, next) => {
  try {
    const queyOptions = req.query;
    const dishes = await dishServices.getAll(queyOptions);

    res.statusCode = 200;
    res.message = 'Fetched dishes data successfully';
    res.data = dishes;

    next();
  } catch (err) {
    console.log('Error in getting all dishes: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const update = async (req, res, next) => {
  try {
    const payload = req.body;
    const dishId = req.params['id'];
    const updatedDish = await dishServices.update(dishId, payload);

    res.statusCode = 200;
    res.message = 'Dish updated successfully';
    res.data = updatedDish;

    next();
  } catch (err) {
    console.log('Error in updating dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const remove = async (req, res, next) => {
  try {
    const dishId = req.params['id'];
    await dishServices.remove(dishId);

    res.statusCode = 204;
    next();
  } catch (err) {
    console.log('Error in deleting dish: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const uplaodImage = async (req, res, next) => {
  try {
    const dishId = req.params['id'];

    const updatedDish = await dishServices.uplaodImage(dishId, req.file);

    res.statusCode = 200;
    res.message = 'Image uploaded successfully';
    res.data = updatedDish;

    next();
  } catch (err) {
    console.log('Error in uploading image for dish: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  createDishesRating,
  deleteRating,
  get,
  getAll,
  update,
  remove,
  uplaodImage,
};

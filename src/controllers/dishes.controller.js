const ratingServices = require('../services/ratings.service');
const commonHelper = require('../helpers/common.helper');
const constants = require('../constants/constants');
// const dishServices = require('../services/dishes.service');

const createDishesRating = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const dishId = req.params['id'];
    const userId = req.user.userId;
    const newRating = await ratingServices.createDishesRating(dishId, rating, userId);

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
    await ratingServices.deleteRating(ratingId, constants.ENTITY_TYPE.DISH, dishId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting rating: ', err);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

module.exports = {
  createDishesRating,
  deleteRating,
};

const { Rating, Dish, Restaurant, Order, Cart } = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');

const createRestaurantsRating = async (restaurantId, value, userId) => {
  const transactionContext = await sequelize.transaction();

  try {
    // console.log(`${entityType} ${restaurantId} ${value} ${userId}`);
    let payload = {
      user_id: userId,
      restaurant_id: restaurantId,
      entity_type: constants.ENTITY_TYPE.RESTAURANT,
      rating: value,
    };

    //check if restaurant exists
    const restaurantExists = await Restaurant.findOne({ where: { id: restaurantId } });

    if (!restaurantExists) {
      throw commonHelpers.customError('No restaurant found with given id', 404);
    }

    // check if rating already exists
    const ratingExists = await Rating.findOne({
      where: {
        [Op.and]: [
          { user_id: userId },
          { entity_type: constants.ENTITY_TYPE.RESTAURANT },
          { restaurant_id: restaurantId },
        ],
      },
    });

    if (ratingExists) {
      throw commonHelpers.customError('User has already rated the restaurant', 409);
    }

    //check if user has ordered something from the restaurant
    const order = await Order.findOne(
      { where: { restaurant_id: restaurantId } },
      { include: { model: Cart, where: { user_id: userId } } }
    );

    if (!order) {
      throw commonHelpers.customError("User has no orders from the restaurant.. can't rate", 403);
    }

    // Creating a rating
    const newRating = await Rating.create(payload, { transaction: transactionContext });
    await transactionContext.commit();
    return newRating;
  } catch (err) {
    console.log('Error while creating rating: ', err.message);
    await transactionContext.rollback();
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const createDishesRating = async (dishId, value, userId) => {
  const transactionContext = await sequelize.transaction();

  try {
    // console.log(`${entityType} ${dishId} ${value} ${userId}`);
    let payload = {
      user_id: userId,
      dish_id: dishId,
      entity_type: constants.ENTITY_TYPE.DISH,
      rating: value,
    };

    //check if dish exists
    const dishExists = await Dish.findOne({
      where: { id: dishId },
    });

    if (!dishExists) {
      throw commonHelpers.customError('Dish does not exist', 404);
    }

    //check if rating already exists
    const ratingExists = await Rating.findOne({
      where: {
        [Op.and]: [{ user_id: userId }, { entity_type: constants.ENTITY_TYPE.DISH }, { dish_id: dishId }],
      },
    });

    if (ratingExists) {
      throw commonHelpers.customError('User has already rated the dish', 409);
    }
    // check if user has ordered the dish
    const order = await Order.findOne({
      include: [
        {
          model: Cart,
          where: { user_id: userId },
          required: true,
        },
        {
          model: Restaurant,
          include: {
            model: Dish,
            as: 'dishes',
            where: {
              id: dishId,
            },
            required: true, // select only matching dishes
          },
          required: true,
        },
      ],
    });

    if (!order) {
      throw commonHelpers.customError("User has not ordered the dish yet, can't rate", 403);
    }

    const rating = await Rating.create(payload);
    await transactionContext.commit();
    return rating;
  } catch (err) {
    console.log('Error in creating ', err);
    await transactionContext.rollback();
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const deleteRestaurantRating = async (restaurantId, ratingId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const rating = await Rating.findOne({
      where: { id: ratingId, restaurant_id: restaurantId },
    });

    if (!rating) {
      throw commonHelpers.customError('No rating found for the restaurant', 404);
    }

    await Rating.destroy({
      where: { id: ratingId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting rating', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const deleteDishRating = async (dishId, ratingId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const rating = await Rating.findOne({
      where: { id: ratingId, dish_id: dishId },
    });

    if (!rating) {
      throw commonHelpers.customError('No rating found for the dish', 404);
    }

    await Rating.destroy({
      where: { id: ratingId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting rating', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  createRestaurantsRating,
  createDishesRating,
  deleteRestaurantRating,
  deleteDishRating,
};

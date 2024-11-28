const { Rating, Dish, Restaurant, Order, Cart } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');

const createRestaurantsRating = async (restaurantId, rating, userId) => {
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
        { entity_id: restaurantId },
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
    throw commonHelpers.customError("User has no orders from the restaurant, can't rate", 403);
  }

  let options = {
    user_id: userId,
    entity_id: restaurantId,
    entity_type: constants.ENTITY_TYPE.RESTAURANT,
    rating,
  };

  const newRating = await Rating.create(options);

  return newRating;
};

const createDishesRating = async (dishId, rating, userId) => {
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
      [Op.and]: [{ user_id: userId }, { entity_type: constants.ENTITY_TYPE.DISH }, { entity_id: dishId }],
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

  let options = {
    user_id: userId,
    entity_id: dishId,
    entity_type: constants.ENTITY_TYPE.DISH,
    rating,
  };

  const newRating = await Rating.create(options);

  return newRating;
};

const deleteRating = async (ratingId, entityType, entityId) => {
  const filter = { id: ratingId };
  entityType === 'dish' ? (filter.entity_id = entityId) : (filter.entity_id = entityId);

  const rating = await Rating.findOne({
    where: filter,
  });

  if (!rating) {
    throw commonHelpers.customError('No rating found for the dish', 404);
  }

  await Rating.destroy({
    where: filter,
  });

  return;
};

module.exports = {
  createRestaurantsRating,
  createDishesRating,
  deleteRating,
};

const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { uploadToS3 } = require('../helpers/image-upload.helper');
const commonHelpers = require('../helpers/common.helper');
const { Restaurant, Dish, Rating } = require('../models');
const constants = require('../constants/constants');

const create = async data => {
  const transactionContext = await sequelize.transaction();
  try {
    const { name, description, category, address } = data;

    // Creating a restaurant
    const newRestaurant = await Restaurant.create(
      {
        name,
        description,
        category,
        address: address,
      },
      { transaction: transactionContext }
    );

    if (newRestaurant) await transactionContext.commit();

    return newRestaurant;
  } catch (err) {
    console.log('Error in creating restaurant: ', err);
    await transactionContext.rollback();
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const get = async restaurantId => {
  if (!restaurantId) {
    throw commonHelpers.customError('Restaurant id not found', 422);
  }

  const restaurant = await Restaurant.findOne({
    where: { id: restaurantId },
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('ratings.rating')), 2), 'avg_rating'],
        [sequelize.fn('count', sequelize.col('ratings.rating')), 'ratings_cnt'],
      ],
    },
    include: [
      {
        model: Dish,
        as: 'dishes',
        attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
      },
      {
        model: Rating,
        as: 'ratings',
        attributes: [],
      },
    ],
    group: ['Restaurant.id', 'dishes.id'],
  });

  if (!restaurant) {
    throw commonHelpers.customError('No restaurant found', 404);
  }

  return restaurant;
};

const getAll = async queryOptions => {
  const { city, name, category, orderBy = 'asc', page = 1, limit = 10 } = queryOptions;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let filter = {};

  if (city) filter['address.city'] = { [Op.iLike]: city };

  if (name) filter.name = { [Op.iLike]: `%${name}%` };

  if (category)
    filter.category = sequelize.where(sequelize.cast(sequelize.col('category'), 'varchar'), {
      [Op.iLike]: category,
    });

  const order = orderBy === 'asc' ? constants.SORT_ORDER.ASC : constants.SORT_ORDER.DESC;

  const restaurants = await Restaurant.findAll({
    where: filter,
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('ratings.rating')), 2), 'avg_rating'],
        [sequelize.fn('count', sequelize.col('ratings.rating')), 'ratings_cnt'],
      ],
    },
    include: [
      {
        model: Rating,
        as: 'ratings',
        attributes: [],
        duplicating: false,
      },
      {
        model: Dish,
        as: 'dishes',
        attributes: ['name', 'image_url', 'description', 'type', 'price'],
        duplicating: false,
      },
    ],
    group: ['Restaurant.id', 'dishes.id'],
    offset: startIndex,
    order: [['avg_rating', `${order} NULLS LAST`]],
    limit: endIndex,
  });
  console.log('RESTAURANTS: ', restaurants);

  // console.log('Restaurant service: ', restaurants);
  if (!restaurants || restaurants.length === 0) {
    throw commonHelpers.customError('No restaurants found', 404);
  }
  return restaurants;
};

const update = async (restaurantId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { name, description, category, address } = payload;

    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      throw commonHelpers.customError('Restaurant not found', 404);
    }

    restaurant.name = name;
    restaurant.description = description;
    restaurant.category = category;
    restaurant.address = address;

    await restaurant.save({ transaction: transactionContext });

    await transactionContext.commit();
    return restaurant;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in updating restaurant', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const remove = async restaurantId => {
  const transactionContext = await sequelize.transaction();
  try {
    const restaurant = await Restaurant.findByPk(restaurantId);

    if (!restaurant) {
      throw commonHelpers.customError('Restaurant not found', 404);
    }

    await Restaurant.destroy({
      where: { id: restaurantId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting restaurant', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const uploadImage = async (restaurantId, file) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if restaurant exists
    const restaurantExists = await Restaurant.findOne({ where: { id: restaurantId } });

    if (!restaurantExists) {
      throw commonHelpers.customError('Restaurant not found', 404);
    }

    const imageUrl = await uploadToS3(file);

    restaurantExists.image_url = imageUrl;
    await restaurantExists.save({ transaction: transactionContext });

    await transactionContext.commit();

    return restaurantExists;
  } catch (err) {
    console.log('Error in uploading image for dish: ', err);
    await transactionContext.rollback();
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
  uploadImage,
};

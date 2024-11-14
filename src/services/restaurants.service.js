const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');
const { Op } = require('sequelize');

const create = async data => {
  const transactionContext = await sequelize.transaction();
  try {
    const { name, description, category, address } = data;

    const lookUpName = name.toLowerCase();
    const restaurantExists = await models.Restaurant.findOne(
      { where: { name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), lookUpName) } },
      { paranoid: false }
    );

    // if restaurant exists actively
    if (restaurantExists && restaurantExists.deleted_at === null) {
      throw commonHelpers.customError('Restaurant already exists', 409);
    } else if (restaurantExists?.deleted_at) {
      models.user.restore({
        where: { id: restaurantExists.id },
        transaction: transactionContext,
      });
      return restaurantExists;
    }

    // Creating a user
    const newRestaurant = await models.Restaurant.create(
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

  const restaurant = await models.Restaurant.findOne({
    where: { id: restaurantId },
    attributes: [
      'id',
      'name',
      'description',
      'image_url',
      'category',
      'address',
      [sequelize.fn('round', sequelize.fn('avg', sequelize.col('ratings.rating')), 2), 'avg_rating'],
      [sequelize.fn('count', sequelize.col('ratings.rating')), 'ratings_cnt'],
    ],
    include: [
      {
        model: models.Dish,
        as: 'dishes',
        attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
      },
      {
        model: models.Rating,
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
  console.log('Query options: ', queryOptions);
  const { city = '', name = '', category, orderBy = 1, page = 1, limit = 10 } = queryOptions;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let filter = {};

  if (city) {
    filter = { 'address.city': { [Op.iLike]: city } };
  } else if (name) {
    filter = { name: { [Op.iLike]: `%${name}%` } };
  } else if (category) {
    filter = {
      category: sequelize.where(sequelize.cast(sequelize.col('category'), 'varchar'), {
        [Op.iLike]: category,
      }),
    };
  }

  const order = orderBy === '1' || orderBy === '0' ? 'ASC' : 'DESC';

  const restaurants = await models.Restaurant.findAll({
    where: filter,
    attributes: [
      'id',
      'name',
      'description',
      'category',
      'image_url',
      'address',
      [
        models.sequelize.fn('round', models.sequelize.fn('avg', models.sequelize.col('ratings.rating')), 2),
        'avg_rating',
      ],
      [models.sequelize.fn('count', models.sequelize.col('ratings.rating')), 'ratings_cnt'],
    ],
    include: [
      {
        model: models.Rating,
        as: 'ratings',
        attributes: [],
        duplicating: false,
      },
      {
        model: models.Dish,
        as: 'dishes',
        attributes: ['name', 'image_url', 'description', 'type', 'price'],
        duplicating: false,
      },
    ],
    group: ['Restaurant.id', 'dishes.id'],
    offset: startIndex,
    order: [['avg_rating', order]],
    limit: endIndex,
  });

  // console.log('Restaurant service: ', restaurants);
  if (!restaurants || restaurants.length === 0) {
    throw commonHelpers.customError('No restaurants found', 404);
  }
  return restaurants;
};

const remove = async restaurantId => {
  const transactionContext = await sequelize.transaction();
  try {
    const deletedCount = await models.Restaurant.destroy({
      where: { id: restaurantId },
      transaction: transactionContext,
    });
    console.log('Deleted Dish: ', deletedCount);

    if (deletedCount === 0) {
      throw commonHelpers.customError('No restaurant found', 404);
    }
    await transactionContext.commit();
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting restaurant', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const uploadImage = async (restaurantId, file) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!restaurantId) {
      throw commonHelpers.customError('No restaurant id provided', 400);
    }

    const url = file.location;

    const [updatedCnt, updatedRestaurant] = await models.Restaurant.update(
      { image_url: url },
      { where: { id: restaurantId }, returning: true, transaction: transactionContext }
    );

    if (updatedCnt === 0) {
      throw commonHelpers.customError('No restaurant found: ', 404);
    }
    // console.log('UPDATED RESTAURANT: ', updatedRestaurant);

    await transactionContext.commit();

    return updatedRestaurant;
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
  remove,
  uploadImage,
};

const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');

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
  remove,
  uploadImage,
};

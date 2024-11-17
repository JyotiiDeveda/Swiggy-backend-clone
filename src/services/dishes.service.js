const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');

const create = async (restaurantId, data) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { name, description, image, category, price, quantity } = data;

    // console.log(`${name}, ${restaurantId}, ${description}, ${image}, ${category}, ${price}, ${quantity}`);
    const restaurantExists = await models.Restaurant.findOne({ where: { id: restaurantId } });

    if (!restaurantExists) {
      throw commonHelpers.customError('Restaurant does not exist', 404);
    }

    const lookUpName = name.toLowerCase();
    const dishExists = await models.Dish.findOne({
      where: {
        restaurant_id: restaurantId,
        name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), lookUpName),
      },
    });

    if (dishExists) {
      console.log('DISH ALERADY EXISTS');
      throw commonHelpers.customError('Dish already exists', 409);
    }

    // todo: upload image to cloud and get image url

    // Creating a dish
    const newDish = await models.Dish.create(
      {
        restaurant_id: restaurantId,
        name,
        description,
        image_url: image,
        type: category,
        price,
        quantity,
      },
      { transaction: transactionContext }
    );

    if (newDish) await transactionContext.commit();
    return newDish;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in creating dish', err.message);
    throw commonHelpers.customError(err.message, 409);
  }
};

const get = async dishId => {
  if (!dishId) {
    throw commonHelpers.customError('Dish id not found', 422);
  }

  const dish = await models.Dish.findOne({
    where: { id: dishId },
    attributes: [
      'id',
      'name',
      'description',
      'image_url',
      'type',
      'price',
      'quantity',
      [
        models.sequelize.fn('round', models.sequelize.fn('avg', models.sequelize.col('ratings.rating')), 2),
        'avg_rating',
      ],
      [models.sequelize.fn('count', models.sequelize.col('ratings.rating')), 'ratings_cnt'],
    ],
    include: {
      model: models.Rating,
      as: 'ratings',
      attributes: [],
    },
    group: ['Dish.id'],
  });

  if (!dish) {
    throw commonHelpers.customError('No restaurant found', 404);
  }

  return dish;
};

const update = async (dishId, payload) => {
  const transactionContext = await models.sequelize.transaction();
  try {
    const { name, description, image, category, price, quantity } = payload;

    const [updatedDishCnt, updatedDish] = await models.Dish.update(
      {
        name,
        description,
        image_url: image,
        type: category,
        price,
        quantity,
      },
      {
        where: { id: dishId },
        transaction: transactionContext,
        returning: true,
      }
    );

    // console.log('UPDATED DISH COUNT: ', updatedDishCnt, updatedDish);
    if (updatedDishCnt === 0) {
      throw commonHelpers.customError('Dish not found', 404);
    }
    await transactionContext.commit();
    return updatedDish;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in updating dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const remove = async dishId => {
  const transactionContext = await sequelize.transaction();
  try {
    const deletedCount = await models.Dish.destroy({ where: { id: dishId } });
    console.log('Deleted Dish: ', deletedCount);

    if (deletedCount === 0) {
      throw commonHelpers.customError('No dish found', 404);
    }
    await transactionContext.commit();
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const uplaodImage = async (dishId, file) => {
  const transactionContext = await models.sequelize.transaction();
  try {
    if (!dishId) {
      throw commonHelpers.customError('No dish id provided', 400);
    }

    const url = file.location;

    const [updatedCnt, updatedRestaurant] = await models.Dish.update(
      { image_url: url },
      { where: { id: dishId }, returning: true, transaction: transactionContext }
    );

    if (updatedCnt === 0) {
      throw commonHelpers.customError('No dish found: ', 404);
    }
    // console.log('UPDATED DISH: ', updatedRestaurant);

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
  update,
  remove,
  uplaodImage,
};

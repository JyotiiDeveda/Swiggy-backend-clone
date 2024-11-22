const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { uploadToS3 } = require('../helpers/image-upload.helper');
const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const constants = require('../constants/constants');

const create = async (restaurantId, data) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { name, description, category, price } = data;

    // console.log(`${name}, ${restaurantId}, ${description}, ${image}, ${category}, ${price}`);
    const restaurantExists = await models.Restaurant.findOne({ where: { id: restaurantId } });

    if (!restaurantExists) {
      throw commonHelpers.customError('Restaurant does not exist', 404);
    }

    const dishType = category.toLowerCase();
    if (
      dishType === constants.DISH_CATEGORY.NON_VEG &&
      restaurantExists.category === constants.RESTAURANT_CATEGORY.VEG
    ) {
      throw commonHelpers.customError('A non-vegeterian dish cannot be added to vegeterian restaurant', 422);
    }

    const lookUpName = name.toLowerCase();
    const dishExists = await models.Dish.findOne({
      where: {
        restaurant_id: restaurantId,
        name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), lookUpName),
      },
    });

    if (dishExists) {
      throw commonHelpers.customError('Dish already exists', 409);
    }

    // Creating a dish
    const newDish = await models.Dish.create(
      {
        restaurant_id: restaurantId,
        name,
        description,
        type: dishType,
        price,
      },
      { transaction: transactionContext }
    );

    if (newDish) await transactionContext.commit();
    return newDish;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in creating dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const get = async (restaurantId, dishId) => {
  // get a dish with its average rating and ratings count
  const dish = await models.Dish.findOne({
    where: { id: dishId, restaurant_id: restaurantId },
    attributes: {
      include: [
        [
          models.sequelize.fn('round', models.sequelize.fn('avg', models.sequelize.col('ratings.rating')), 2),
          'avg_rating',
        ],
        [models.sequelize.fn('count', models.sequelize.col('ratings.rating')), 'ratings_cnt'],
      ],
    },
    include: [
      {
        model: models.Rating,
        as: 'ratings',
        attributes: [],
      },
    ],
    group: ['Dish.id'],
  });

  if (!dish) {
    throw commonHelpers.customError('No dish found', 404);
  }

  return dish;
};

const getAll = async (restaurantId, queryOptions) => {
  // sortBy --- price or rating
  // orderBy --- ascending or descending
  const { name, category, sortBy = '', orderBy = 1, page = 1, limit = 10 } = queryOptions;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let filter = { restaurant_id: restaurantId };

  if (name) filter.name = { [Op.iLike]: `%${name}%` };
  if (category)
    filter.type = sequelize.where(sequelize.cast(sequelize.col('type'), 'varchar'), {
      [Op.iLike]: category,
    });

  const order = orderBy === 'asc' ? constants.SORT_ORDER.ASC : constants.SORT_ORDER.DESC;
  const sort = sortBy === 'price' ? 'price' : 'avg_rating';

  console.log('FILTER: ', filter);

  const dishes = await models.Dish.findAll({
    where: filter,
    attributes: {
      include: [
        [
          models.sequelize.fn('round', models.sequelize.fn('avg', models.sequelize.col('ratings.rating')), 2),
          'avg_rating',
        ],
        [models.sequelize.fn('count', models.sequelize.col('ratings.rating')), 'ratings_cnt'],
      ],
    },
    include: [
      {
        model: models.Restaurant,
        attributes: ['name'],
        duplicating: false,
      },
      {
        model: models.Rating,
        as: 'ratings',
        attributes: [],
        duplicating: false,
      },
    ],
    group: ['Dish.id', 'Restaurant.id'],
    offset: startIndex,
    order: [[sort, `${order} NULLS LAST`]],
    limit: endIndex,
  });

  // console.log('dishes service: ', restaurants);
  if (!dishes || dishes.length === 0) {
    throw commonHelpers.customError('No dishes found', 404);
  }

  return dishes;
};

const update = async (restaurantId, dishId, payload) => {
  const transactionContext = await models.sequelize.transaction();
  try {
    const { name, description, category, price } = payload;

    const [updatedDishCnt, updatedDish] = await models.Dish.update(
      {
        name,
        description,
        type: category,
        price,
      },
      {
        where: { id: dishId, restaurant_id: restaurantId },
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

const remove = async (restaurantId, dishId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const deletedCount = await models.Dish.destroy({
      where: { id: dishId, restaurant_id: restaurantId },
      transaction: transactionContext,
    });

    if (deletedCount === 0) {
      throw commonHelpers.customError('No dish found', 404);
    }
    await transactionContext.commit();

    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const uplaodImage = async (restaurantId, dishId, file) => {
  const transactionContext = await models.sequelize.transaction();
  try {
    // check if restaurant exists
    const dishExists = await models.Dish.findOne({ where: { id: dishId, restaurant_id: restaurantId } });

    if (!dishExists) {
      throw commonHelpers.customError('Dish not found', 404);
    }

    const imageUrl = await uploadToS3(file);

    dishExists.image_url = imageUrl;
    await dishExists.save({ transaction: transactionContext });

    await transactionContext.commit();

    return dishExists;
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
  uplaodImage,
};

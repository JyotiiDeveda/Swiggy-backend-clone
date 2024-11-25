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

  const options = {
    where: { id: restaurantId },
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('ratings.rating')), 2), 'averageRating'],
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
  };
  const restaurant = await Restaurant.findOne(options);

  if (!restaurant) {
    throw commonHelpers.customError('No restaurant found', 404);
  }

  return restaurant;
};

const getAll = async queryOptions => {
  const {
    city = '',
    name = '',
    category = constants.RESTAURANT_CATEGORY.VEG,
    orderBy = constants.SORT_ORDER.ASC,
    page = 1,
    limit = 10,
  } = queryOptions;

  const offset = (page - 1) * limit;

  let filter = {};

  if (city) filter['address.city'] = { [Op.iLike]: city };

  if (name) filter.name = { [Op.iLike]: `%${name}%` };

  if (category)
    filter.category = sequelize.where(sequelize.cast(sequelize.col('category'), 'varchar'), {
      [Op.iLike]: category,
    });

  // console.log(
  //   `city: ${city} name: ${name} category: ${category} orderBy: ${orderBy} page: ${page} limit: ${limit}`
  // );

  const options = {
    where: filter,
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('ratings.rating')), 2), 'averageRating'],
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
    ],
    group: ['Restaurant.id'],
    order: [[constants.SORT_BY.AVERAGE_RATING, `${orderBy} NULLS LAST`]],
  };

  let restaurantsData;
  await Promise.all([
    Restaurant.count(options),
    Restaurant.findAll({ ...options, offset: offset, limit }),
  ]).then(values => {
    restaurantsData = values;
  });
  console.log('Restaurant: ', restaurantsData);

  const restaurantsCount = restaurantsData[0]?.length;
  const restaurants = restaurantsData[1];

  if (!restaurantsCount || restaurantsCount === 0) {
    commonHelpers.customError('Restaurants not found', 404);
  }

  const response = {
    rows: restaurants,
    pagination: {
      totalRecords: restaurantsCount,
      currentPage: parseInt(page),
      recordsPerPage: parseInt(limit),
      noOfPages: Math.ceil(restaurantsCount / limit),
    },
  };

  return response;
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

    const imageUrl = await uploadToS3(file, restaurantExists.id);

    restaurantExists.image_url = imageUrl;
    await restaurantExists.save({ transaction: transactionContext });

    await transactionContext.commit();

    return { imageUrl };
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

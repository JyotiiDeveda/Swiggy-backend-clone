const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { uploadToS3 } = require('../helpers/image-upload.helper');
const commonHelpers = require('../helpers/common.helper');
const { Restaurant, Dish, Rating, City } = require('../models');
const constants = require('../constants/constants');

const create = async data => {
  const { name, description, category, address, city } = data;

  // Creating a restaurant
  const newRestaurant = await Restaurant.create({
    name,
    description,
    category,
    address: address,
    city_id: city,
  });

  if (!newRestaurant) throw commonHelpers.customError('Failed to create restaurant', 400);

  return newRestaurant;
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
    category = '',
    orderBy = constants.SORT_ORDER.ASC,
    page = 1,
    limit = 10,
  } = queryOptions;

  const offset = (page - 1) * limit;

  let filter = {};

  if (city) filter.city_id = city;

  if (name) filter.name = { [Op.iLike]: `%${name}%` };

  if (category)
    filter.category = sequelize.where(sequelize.cast(sequelize.col('category'), 'varchar'), {
      [Op.iLike]: category,
    });

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
      {
        model: City,
        attributes: ['id', 'name'],
      },
    ],
    group: ['Restaurant.id', 'City.id'],
    order: [[constants.SORT_BY.AVERAGE_RATING, `${orderBy} NULLS LAST`]],
  };

  const [totalRecords, restaurants] = await Promise.all([
    Restaurant.count({ where: filter }),
    Restaurant.findAll({ ...options, offset, limit }),
  ]);

  if (totalRecords === 0) {
    throw commonHelpers.customError('Restaurants not found', 404);
  }

  const response = {
    rows: restaurants,
    pagination: {
      totalRecords,
      currentPage: parseInt(page),
      recordsPerPage: parseInt(limit),
      noOfPages: Math.ceil(totalRecords / limit),
    },
  };

  return response;
};

const update = async (restaurantId, payload) => {
  const { name, description, category, address } = payload;

  const restaurant = await Restaurant.findByPk(restaurantId);

  if (!restaurant) {
    throw commonHelpers.customError('Restaurant not found', 404);
  }

  restaurant.name = name;
  restaurant.description = description;
  restaurant.category = category;
  restaurant.address = address;

  await restaurant.save();

  return restaurant;
};

const remove = async restaurantId => {
  const restaurant = await Restaurant.findByPk(restaurantId);

  if (!restaurant) {
    throw commonHelpers.customError('Restaurant not found', 404);
  }

  await Restaurant.destroy({
    where: { id: restaurantId },
  });

  return;
};

const uploadImage = async (restaurantId, file) => {
  // check if restaurant exists
  const restaurantExists = await Restaurant.findOne({ where: { id: restaurantId } });

  if (!restaurantExists) {
    throw commonHelpers.customError('Restaurant not found', 404);
  }

  const imageUrl = await uploadToS3(file, restaurantExists.id);

  restaurantExists.image_url = imageUrl;
  await restaurantExists.save();

  return { imageUrl };
};

module.exports = {
  create,
  get,
  getAll,
  update,
  remove,
  uploadImage,
};

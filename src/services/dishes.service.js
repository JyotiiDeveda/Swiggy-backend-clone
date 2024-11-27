const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { Dish, Restaurant, Rating } = require('../models');

const { uploadToS3 } = require('../helpers/image-upload.helper');
const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');

const create = async (restaurantId, data) => {
  const { name, description, category, price } = data;

  // console.log(`${name}, ${restaurantId}, ${description}, ${image}, ${category}, ${price}`);
  const restaurantExists = await Restaurant.findOne({ where: { id: restaurantId } });

  if (!restaurantExists) {
    throw commonHelpers.customError('Restaurant does not exist', 404);
  }

  const lookUpName = name.toLowerCase();
  const dishExists = await Dish.findOne({
    where: {
      restaurant_id: restaurantId,
      name: sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), lookUpName),
    },
  });

  if (dishExists) {
    throw commonHelpers.customError('Dish already exists', 409);
  }

  const dishType = category.toLowerCase();
  if (
    dishType === constants.DISH_CATEGORY.NON_VEG &&
    restaurantExists.category === constants.RESTAURANT_CATEGORY.VEG
  ) {
    throw commonHelpers.customError('A non-vegetarian dish cannot be added to vegetarian restaurant', 422);
  }

  // Creating a dish
  const newDish = await Dish.create({
    restaurant_id: restaurantId,
    name,
    description,
    type: dishType,
    price,
  });

  if (!newDish) commonHelpers.customError('Failed to create dish', 400);

  return newDish;
};

const get = async payload => {
  // get a dish with its average rating and ratings count
  const { restaurantId, dishId } = payload;

  const options = {
    where: { id: dishId, restaurant_id: restaurantId },
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
      },
    ],
    group: ['Dish.id'],
  };

  const dish = await Dish.findOne(options);

  if (!dish) {
    throw commonHelpers.customError('No dish found', 404);
  }

  return dish;
};

const getAll = async (restaurantId, queryOptions) => {
  const {
    name = '',
    category = constants.DISH_CATEGORY.VEG,
    sortBy = constants.SORT_BY.PRICE,
    orderBy = constants.SORT_ORDER.ASC,
    page = 1,
    limit = 10,
  } = queryOptions;

  const restaurantExists = await Restaurant.findByPk(restaurantId);

  if (!restaurantExists) {
    throw commonHelpers.customError('Restaurant not found', 404);
  }

  const offset = (page - 1) * limit;

  let filter = { restaurant_id: restaurantId };

  if (name) filter.name = { [Op.iLike]: `%${name}%` };
  if (category)
    filter.type = sequelize.where(sequelize.cast(sequelize.col('type'), 'varchar'), {
      [Op.iLike]: category,
    });

  const options = {
    where: filter,
    attributes: {
      include: [
        [sequelize.fn('round', sequelize.fn('avg', sequelize.col('ratings.rating')), 2), 'averageRating'],
        [sequelize.fn('count', sequelize.col('ratings.rating')), 'ratingsCount'],
      ],
    },
    include: [
      {
        model: Restaurant,
        attributes: ['name'],
        duplicating: false,
      },
      {
        model: Rating,
        as: 'ratings',
        attributes: [],
        duplicating: false,
      },
    ],
    group: ['Dish.id', 'Restaurant.id'],
    order: [[sortBy, `${orderBy} NULLS LAST`]],
  };

  const [dishesCount, dishes] = await Promise.all([
    Dish.count({ where: filter }), // Returns total count of dishes
    Dish.findAll({ ...options, offset, limit }), // Fetches paginated dishes
  ]);

  if (dishesCount === 0) {
    throw commonHelpers.customError('No dishes avaliable in the restaurant', 404);
  }

  const response = {
    rows: dishes,
    pagination: {
      totalRecords: dishesCount,
      currentPage: parseInt(page),
      recordsPerPage: parseInt(limit),
      noOfPages: Math.ceil(dishesCount / limit),
    },
  };

  return response;
};

const update = async (params, payload) => {
  const { restaurantId, dishId } = params;
  const { name, description, category, price } = payload;

  const dish = await Dish.findOne({
    where: { id: dishId, restaurant_id: restaurantId },
  });

  if (!dish) {
    throw commonHelpers.customError('Dish not found', 404);
  }

  dish.name = name;
  dish.description = description;
  dish.type = category;
  dish.price = price;

  await dish.save();

  return dish;
};

const remove = async params => {
  const { restaurantId, dishId } = params;

  const dish = await Dish.findOne({
    where: { id: dishId, restaurant_id: restaurantId },
  });

  if (!dish) {
    throw commonHelpers.customError('Dish not found', 404);
  }

  await Dish.destroy({
    where: { id: dishId },
  });

  return;
};

const uploadImage = async (dishId, file) => {
  // check if dish exists
  const dishExists = await Dish.findOne({ where: { id: dishId } });

  if (!dishExists) {
    throw commonHelpers.customError('Dish not found', 404);
  }

  const imageUrl = await uploadToS3(file, dishExists.id);

  dishExists.image_url = imageUrl;
  await dishExists.save();

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

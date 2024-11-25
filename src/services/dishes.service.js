const { sequelize } = require('../models');
const { Op } = require('sequelize');
const { Dish, Restaurant, Rating } = require('../models');

const { uploadToS3 } = require('../helpers/image-upload.helper');
const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');

const create = async (restaurantId, data) => {
  const transactionContext = await sequelize.transaction();
  try {
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
    const newDish = await Dish.create(
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
  // sortBy --- price or rating
  // orderBy --- ascending or descending
  const {
    name = '',
    category = constants.DISH_CATEGORY.VEG,
    sortBy = constants.SORT_BY.PRICE,
    orderBy = constants.SORT_ORDER.ASC,
    page = 1,
    limit = 10,
  } = queryOptions;

  const offset = (page - 1) * limit;

  let filter = restaurantId ? { restaurant_id: restaurantId } : {};

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

  let dishesData;
  await Promise.all([Dish.count(options), Dish.findAll({ ...options, offset: offset, limit })]).then(
    values => (dishesData = values)
  );
  console.log('Dishes: ', dishesData);

  const dishesCount = dishesData[0]?.length;
  const dishes = dishesData[1];

  if (!dishesCount || dishesCount === 0) {
    commonHelpers.customError('Restaurants not found', 404);
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

const update = async (restaurantId, dishId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
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

    await dish.save({ transaction: transactionContext });

    return dish;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in updating dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const remove = async (restaurantId, dishId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const dish = await Dish.findOne({
      where: { id: dishId, restaurant_id: restaurantId },
    });

    if (!dish) {
      throw commonHelpers.customError('Dish not found', 404);
    }

    await Dish.destroy({
      where: { id: dishId },
      transaction: transactionContext,
    });

    await transactionContext.commit();

    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const uploadImage = async (restaurantId, dishId, file) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if restaurant exists
    const dishExists = await Dish.findOne({ where: { id: dishId, restaurant_id: restaurantId } });

    if (!dishExists) {
      throw commonHelpers.customError('Dish not found', 404);
    }

    const imageUrl = await uploadToS3(file, dishExists.id);

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
  uploadImage,
};

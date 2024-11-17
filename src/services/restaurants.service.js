const commonHelpers = require('../helpers/common.helper');
const models = require('../models');

const create = async data => {
  const { name, description, image, category, address } = data;
  const restaurantExists = await models.Restaurant.findOne({ where: { name } }, { paranoid: false });

  // if user exists actively
  if (restaurantExists && restaurantExists.deleted_at === null) {
    throw commonHelpers.customError('Restaurant already exists', 409);
  }

  // if soft deleted, activate the user
  else if (restaurantExists?.deleted_at) {
    models.user.restore({ where: { id: restaurantExists.id } });
    return restaurantExists;
  }

  // todo: upload image to cloud and get image url

  // Creating a user
  const newRestaurant = await models.Restaurant.create({
    name,
    description,
    image_url: image,
    category,
    address: JSON.stringify(address),
  });

  return newRestaurant;
};

const get = async restaurantId => {
  if (!restaurantId) {
    throw commonHelpers.customError('Restaurant id not found', 422);
  }

  const restaurant = await models.Restaurant.findOne({
    where: { id: restaurantId },
    include: {
      model: models.Dish,
      as: 'dishes',
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
    },
  });

  if (!restaurant) {
    throw commonHelpers.customError('No restaurant found', 404);
  }

  return restaurant;
};

const remove = async restaurantId => {
  await models.Restaurant.destroy({ where: { id: restaurantId } });
  console.log('Deleted Restaurant');
};

const uploadImage = async (restaurantId, file) => {
  const transactionContext = await models.sequelize.transaction();
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

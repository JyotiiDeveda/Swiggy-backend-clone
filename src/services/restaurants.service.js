const commonHelpers = require('../helpers/common.helper');
const models = require('../models');

const create = async data => {
  const { name, description, image, category, address } = data;
  const restaurantExists = await models.Restaurant.findOne({ where: { name } }, { paranoid: false });
  console.log('Existing restaurant: ', restaurantExists);

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

module.exports = {
  create,
};

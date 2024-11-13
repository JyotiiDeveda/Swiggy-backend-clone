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
    console.log('ERRROR----- ', err.statusCode);
    throw commonHelpers.customError(err.message, 409);
  }
};

module.exports = {
  create,
};

const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { Op } = require('sequelize');

const createRestaurantsRating = async (entityId, value, userId) => {
  const transactionContext = await models.sequelize.transaction();

  try {
    // console.log(`${entityType} ${entityId} ${value} ${userId}`);
    let payload = {
      user_id: userId,
      restaurant_id: entityId,
      entity_type: 'restaurant',
      rating: value,
    };

    //check if restaurant exists
    const restaurantExists = await models.Restaurant.findOne({ where: { id: entityId } });
    console.log('RESTAURANT EXISTS: ', restaurantExists);

    if (!restaurantExists) {
      throw commonHelpers.customError('No restaurant found with given id', 404);
    }

    // check if rating already exists
    const ratingExists = await models.Rating.findOne(
      {
        where: {
          [Op.and]: [{ user_id: userId }, { entity_type: 'restaurant' }, { restaurant_id: entityId }],
        },
      },
      { paranoid: false }
    );

    if (ratingExists) {
      if (ratingExists.deleted_at === null) await models.Rating.restore({ where: { id: ratingExists.id } });
      throw commonHelpers.customError('User has already rated the restaurant', 409);
    }

    //check if user has ordered something from the restaurant
    const order = await models.Order.findOne(
      { where: { restaurant_id: entityId } },
      { include: { model: models.Cart, where: { user_id: userId } } }
    );
    console.log('Order for the restaurant: ', order);

    if (!order) {
      throw commonHelpers.customError("User has no orders from the restaurant.. can't rate", 403);
    }

    // Creating a rating
    const newRating = await models.Rating.create(payload, { transaction: transactionContext });
    await transactionContext.commit();
    return newRating;
  } catch (err) {
    console.log('Error while creating rating: ', err.message);
    await transactionContext.rollback();
    throw commonHelpers.customError(err.message, 400);
  }
};

module.exports = {
  createRestaurantsRating,
};

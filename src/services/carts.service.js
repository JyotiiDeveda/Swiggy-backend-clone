const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');
const models = require('../models');
const { sequelize } = require('../models');

const getCartDishes = async (cartId, userId) => {
  const cartDishes = await models.Cart.findOne({
    where: {
      id: cartId,
      user_id: userId,
    },
    include: {
      model: models.Dish,
      as: 'dishes',
      include: {
        model: models.Restaurant,
        attributes: ['id', 'name', 'category'],
      },
    },
  });

  if (!cartDishes || cartDishes.length === 0) {
    throw commonHelpers.customError('Cart dishes not found');
  }

  return cartDishes;
};

const addItem = async (userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { dish_id: dishId, quantity } = payload;
    // check if dish exists
    const dishDetails = await models.Dish.findOne({ where: { id: dishId } });

    if (!dishDetails) {
      throw commonHelpers.customError('Dish not available', 404);
    }

    //find active cart or create one
    const [cart, created] = await models.Cart.findOrCreate({
      where: { user_id: userId, status: constants.CART_STATUS.ACTIVE },
      attributes: {
        include: [
          [sequelize.fn('count', sequelize.col('dishes.id')), 'dishes_cnt'],
          [sequelize.col('dishes.restaurant_id'), 'restaurant_id'],
        ],
        exclude: ['created_at', 'updated_at', 'deleted_at'],
      },
      include: {
        model: models.Dish,
        as: 'dishes',
        duplicating: false,
        attributes: [],
        through: { attributes: [], where: { deleted_at: null } },
      },
      group: ['Cart.id', 'dishes.restaurant_id'],
      transaction: transactionContext,
    });

    // if cart was existing already
    if (!created) {
      const dishInCart = await models.CartDish.findOne({ where: { cart_id: cart.id, dish_id: dishId } });

      if (dishInCart) {
        dishInCart.quantity = quantity;
        await dishInCart.save({ transaction: transactionContext });
        return dishInCart;
      }

      const cartRestaurantId = cart.dataValues.restaurant_id;
      const dishRestaurantId = dishDetails.restaurant_id;

      // think
      if (cartRestaurantId && cartRestaurantId !== dishRestaurantId) {
        throw commonHelpers.customError(
          'Adding dishes from different restaurant will replace the existing dishes in cart',
          409
        );
      } else if (cartRestaurantId === dishRestaurantId && parseInt(cart.dataValues.dishes_cnt) >= 5) {
        throw commonHelpers.customError('Five items can only be added in a cart', 400);
      }
    }

    const cartDish = await models.CartDish.create(
      {
        cart_id: cart.id,
        dish_id: dishDetails.id,
        price: dishDetails.price,
        quantity,
      },
      { transaction: transactionContext }
    );

    if (!cartDish) throw commonHelpers.customError('Failed to add dish', 400);

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in adding dish to cart', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const removeItem = async (userId, cartId, dishId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const deletedCount = await models.CartDish.destroy({
      where: { cart_id: cartId, dish_id: dishId },
      include: {
        model: models.Cart,
        where: { user_id: userId },
      },
      transaction: transactionContext,
    });

    if (deletedCount === 0) {
      throw commonHelpers.customError('Dish not found in the cart', 404);
    }
    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in removing dish from cart', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const emptyCart = async (userId, cartId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const activeCartExists = await models.Cart.findOne({
      where: { id: cartId, user_id: userId, status: constants.CART_STATUS.ACTIVE },
    });

    if (!activeCartExists) {
      throw commonHelpers.customError('No active cart exists', 404);
    }

    const deletedCount = await models.CartDish.destroy({
      where: { cart_id: cartId },
      transaction: transactionContext,
    });

    if (deletedCount === 0) {
      throw commonHelpers.customError('No dishes found in the cart', 404);
    }
    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error while emptying cart', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  getCartDishes,
  addItem,
  removeItem,
  emptyCart,
};

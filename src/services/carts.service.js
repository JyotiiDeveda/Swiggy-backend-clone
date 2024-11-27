const { sequelize } = require('../models');
const { Cart, Dish, CartDish, Restaurant } = require('../models');
const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');

const getCartDishes = async (cartId, userId) => {
  const cart = await Cart.findOne({
    where: {
      id: cartId,
      user_id: userId,
    },
  });

  if (!cart) {
    throw commonHelpers.customError('No cart found for the user', 404);
  }

  const cartDishes = await Cart.findOne({
    where: {
      id: cart.id,
    },
    include: {
      model: Dish,
      as: 'dishes',
      include: {
        model: Restaurant,
        attributes: ['id', 'name', 'category'],
      },
    },
  });

  if (!cartDishes) {
    throw commonHelpers.customError('Cart dishes not found', 404);
  } else if (cartDishes?.dishes.length === 0) {
    throw commonHelpers.customError('Cart is empty', 400);
  }
  return cartDishes;
};

const addItem = async (userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { dishId, quantity } = payload;

    const dishDetails = await Dish.findOne({ where: { id: dishId } });

    if (!dishDetails) {
      throw commonHelpers.customError('Dish not available', 404);
    }

    //find active cart or create one
    const [cart, created] = await Cart.findOrCreate({
      where: { user_id: userId, status: constants.CART_STATUS.ACTIVE },
      attributes: {
        include: [
          [sequelize.fn('count', sequelize.col('dishes.id')), 'dishes_cnt'],
          [sequelize.col('dishes.restaurant_id'), 'restaurant_id'],
        ],
        exclude: ['created_at', 'updated_at', 'deleted_at'],
      },
      include: {
        model: Dish,
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
      const dishInCart = await CartDish.findOne({ where: { cart_id: cart.id, dish_id: dishId } });

      if (dishInCart) {
        dishInCart.quantity = quantity;
        await dishInCart.save({ transaction: transactionContext });
        return dishInCart;
      }

      const cartRestaurantId = cart.dataValues.restaurant_id;
      const dishRestaurantId = dishDetails.restaurant_id;

      if (cartRestaurantId && cartRestaurantId !== dishRestaurantId) {
        throw commonHelpers.customError(
          'Adding dishes from different restaurant will replace the existing dishes in cart',
          409
        );
      } else if (cartRestaurantId === dishRestaurantId && parseInt(cart.dataValues.dishes_cnt) >= 5) {
        throw commonHelpers.customError('Five items can only be added in a cart', 400);
      }
    }

    const cartDish = await CartDish.create(
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
    return cartDish;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in adding dish to cart', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const removeItem = async (userId, payload) => {
  const { cartId, dishId } = payload;
  const cartDish = await CartDish.findOne({ where: { dish_id: dishId, cart_id: cartId } });

  if (!cartDish) {
    throw commonHelpers.customError('Dish not found in the cart', 404);
  }

  await CartDish.destroy({
    where: { cart_id: cartId, dish_id: dishId },
  });
  return;
};

const emptyCart = async (userId, cartId) => {
  const activeCartExists = await Cart.findOne({
    where: { id: cartId, user_id: userId, status: constants.CART_STATUS.ACTIVE },
  });

  if (!activeCartExists) {
    throw commonHelpers.customError('No active cart exists', 404);
  }

  const deletedCount = await CartDish.destroy({
    where: { cart_id: cartId },
  });

  if (deletedCount === 0) {
    throw commonHelpers.customError('No dishes found in the cart', 404);
  }
  return;
};

module.exports = {
  getCartDishes,
  addItem,
  removeItem,
  emptyCart,
};

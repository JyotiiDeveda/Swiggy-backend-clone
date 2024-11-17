const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');

const addItem = async (userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { dish_id: dishId, quantity } = payload;
    // check if dish exists
    const dishDetails = await models.Dish.findOne({ where: { id: dishId } });

    if (!dishDetails || dishDetails.quantity === 0) {
      throw commonHelpers.customError('Dish not available', 404);
    }

    // check if quantity is available
    if (quantity > dishDetails.quantity) {
      throw commonHelpers.customError('Required quantity is not available , 406');
    }

    //find active cart or create one
    const [cart, created] = await models.Cart.findOrCreate({
      where: { user_id: userId, status: 'active' },
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
        duplicating: false, //when no attributes are selected from associated table we may get duplicate records
        attributes: [],
        through: { attributes: [] },
      },
      group: ['Cart.id', 'dishes.restaurant_id'],
      transaction: transactionContext,
    });

    // if new cart is not created,
    if (!created) {
      // check if dish exists in cart
      const dishInCart = await models.CartDish.findOne({ where: { cart_id: cart.id, dish_id: dishId } });
      if (dishInCart) {
        dishInCart.quantity = quantity;
        await dishInCart.save({ transaction: transactionContext });
        return dishInCart;
      }

      const cartRestaurant = cart.dataValues.restaurant_id;
      const dishRestaurant = dishDetails.restaurant_id;
      if (cartRestaurant === dishRestaurant && parseInt(cart.dataValues.dishes_cnt) >= 5) {
        throw commonHelpers.customError('Five items can only be added in a cart', 400);
      } else if (cartRestaurant !== dishRestaurant) {
        throw commonHelpers.customError(
          'Adding dishes from different restaurant will replace the existing dishes in cart',
          409
        );
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

    await transactionContext.commit();
    return cartDish;
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
      where: { id: cartId, user_id: userId, status: 'active' },
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
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error while emptying cart', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  addItem,
  removeItem,
  emptyCart,
};

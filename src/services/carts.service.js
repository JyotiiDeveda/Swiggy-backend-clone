const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');

const addItem = async (userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { dish_id: dishId, quantity } = payload;
    // check if dish exists
    const dishDetails = await models.Dish.findOne({ where: { id: dishId } });
    console.log('Dish details: ', dishDetails);

    if (!dishDetails) {
      throw commonHelpers.customError('Dish not found', 404);
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

    // console.log('CART DETAILS: ', cart);

    // if new cart is not created,
    if (!created) {
      // check if dish exists in cart
      const dishInCart = await models.CartDish.findOne({ where: { cart_id: cart.id, dish_id: dishId } });
      console.log('Item already exists: ', dishInCart);
      if (dishInCart) {
        dishInCart.quantity += quantity;
        await dishInCart.save();
        return dishInCart;
      }

      const cartRestaurant = cart.dataValues.restaurant_id;
      const dishRestaurant = dishDetails.restaurant_id;
      if (cartRestaurant === dishRestaurant && parseInt(cart.dataValues.dishes_cnt) >= 5) {
        throw commonHelpers.customError('Five items can only be added in a cart', 400);
      } else if (cartRestaurant !== dishRestaurant) {
        await models.CartDish.destroy({
          where: { cart_id: cart.id },
          force: true,
          transaction: transactionContext,
        });
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

const removeItem = async (cartId, dishId) => {
  const transactionContext = await sequelize.transaction();
  try {
    const deletedCount = await models.CartDish.destroy({
      where: { cart_id: cartId, dish_id: dishId },
      force: true,
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

module.exports = {
  addItem,
  removeItem,
};

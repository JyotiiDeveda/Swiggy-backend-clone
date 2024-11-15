const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');
const constants = require('../constants/constants');

const placeOrder = async (currentUser, userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user can access the endpoint
    if (!currentUser?.userRoles.includes('admin') && currentUser.userId !== userId) {
      throw commonHelpers.customError('A user can only access their own routes', 403);
    }

    const { cart_id: cartId, restaurant_id: restaurantId } = payload;

    // check if cart exists and get associated restaurant
    const cartDetails = await models.Cart.findOne({
      where: { id: cartId, user_id: userId, status: 'active' },
      attributes: {
        include: [
          'id',
          [sequelize.col('dishes.restaurant_id'), 'restaurant_id'],
          [sequelize.fn('count', sequelize.col('dishes.id')), 'dishes_cnt'],
        ],
        exclude: ['created_at', 'updated_at', 'deleted_at'],
      },
      include: {
        model: models.Dish,
        as: 'dishes',
        duplicating: false,
        attributes: [],
        through: { attributes: [] },
      },
      group: ['Cart.id', 'dishes.restaurant_id'],
    });
    if (!cartDetails) {
      throw commonHelpers.customError('Cart not found', 404);
    }

    // check if cart is not empty
    if (parseInt(cartDetails?.dataValues?.dishes_cnt) === 0) {
      throw commonHelpers.customError('Cart is empty', 400);
    }

    // check if given restaurant id belongs to cart
    if (restaurantId !== cartDetails.dataValues.restaurant_id) {
      throw commonHelpers.customError('Restaurant does not belong to given cart', 422);
    }

    // check if order is already placed
    const orderDetails = await models.Order.findOne({
      where: { cart_id: cartId, restaurant_id: restaurantId },
    });

    if (orderDetails) {
      throw commonHelpers.customError('Order already placed', 409);
    }

    // get the cart dishes
    const cartDishDetails = await models.CartDish.findAll({
      cart_id: cartId,
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
    });

    // order charges, delivery charges, total_amt
    let orderCharges = 0;
    cartDishDetails.forEach(cart => {
      orderCharges += cart.quantity * cart.price;
    });

    const deliveryCharges = constants.DELIVERY_CHARGES;

    const gst = (orderCharges * constants.GST_RATE) / 100;

    const totalCost = orderCharges + deliveryCharges + gst;
    console.log(
      `Order charges: ${orderCharges} deliver charges: ${deliveryCharges} gst: ${gst} total cost: ${totalCost}`
    );

    const order = await models.Order.create(
      {
        restaurant_id: restaurantId,
        cart_id: cartId,
        delivery_charges: deliveryCharges.toFixed(2),
        gst: gst.toFixed(2),
        order_charges: orderCharges.toFixed(2),
        total_amount: totalCost.toFixed(2),
      },
      { transaction: transactionContext }
    );

    if (!order) {
      throw commonHelpers.customError('Failed to place error', 400);
    }

    // lock the cart if ordered placed
    cartDetails.status = 'locked';
    await cartDetails.save();

    return order;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in placing order', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  placeOrder,
};

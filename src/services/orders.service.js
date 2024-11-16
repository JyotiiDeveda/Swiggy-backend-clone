const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');
const constants = require('../constants/constants');
const orderSerializer = require('../serializers/orders.serializer');

const placeOrder = async (currentUser, userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user can access the endpoint
    if (!currentUser?.userRoles.includes('Admin') && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
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
      where: { cart_id: cartId },
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
    });

    // order charges, delivery charges, total_amt
    let orderCharges = 0;
    cartDishDetails.forEach(dish => {
      orderCharges += dish.quantity * dish.price;
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

    if (!order || !order.id) {
      throw commonHelpers.customError('Failed to place error', 400);
    }

    // lock the cart if ordered placed
    cartDetails.status = 'locked';
    await cartDetails.save({ transaction: transactionContext });
    await transactionContext.commit();
    return order;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in placing order', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const getOrder = async (currentUser, userId, orderId) => {
  // check if user has the access
  if (!currentUser?.userRoles.includes('Admin') && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }

  const order = await models.Order.findOne({
    where: { id: orderId },
    include: [
      {
        model: models.Cart,
        where: {
          user_id: userId,
        },
        include: {
          model: models.Dish,
          as: 'dishes',
          attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at'],
          },
        },
      },
      {
        model: models.Restaurant,
        attributes: ['id', 'name', 'category'],
      },
    ],
  });

  if (!order) throw commonHelpers.customError('No order found', 404);

  const serialzedOrder = orderSerializer.serializeOrder(order);

  return serialzedOrder;
};

const getAllOrders = async (currentUser, userId, page, limit) => {
  // check if user has the access
  if (!currentUser?.userRoles.includes('Admin') && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const users = await models.Order.findAll({
    attributes: [
      'id',
      [sequelize.col('Order.created_at'), 'orderDate'],
      [sequelize.col('Restaurant.name'), 'restaurant'],
      'delivery_charges',
      'order_charges',
      'gst',
      'total_amount',
      'status',
    ],

    include: [
      {
        model: models.Restaurant,
        attributes: [],
        duplicating: false,
      },
      {
        model: models.Cart,
        where: { user_id: userId },
        attributes: [],
        duplicating: false,
      },
    ],
    offset: startIndex,
    limit: endIndex,
  });
  if (!users || users.length === 0) {
    throw commonHelpers.customError('No users found', 404);
  }
  return users;
};

const deleteOrder = async (currentUser, userId, orderId) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user has the access
    if (!currentUser?.userRoles.includes('Admin') && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    // the order which has not been delivered or cancelled can only be deleted
    const deletedOrder = await models.Order.destroy({
      where: { id: orderId, status: 'preparing' },
      returning: true,
      transaction: transactionContext,
    });

    if (!deletedOrder || deletedOrder?.length === 0) {
      throw commonHelpers.customError('No order found', 404);
    }

    const associatedCartId = deletedOrder[0].cart_id;
    // delete associated cart
    const deletedCart = await models.Cart.destroy({
      where: { id: associatedCartId },
      transaction: transactionContext,
    });

    if (deletedCart === 0) {
      throw commonHelpers.customError('Associated cart not found', 404);
    }
    await transactionContext.commit();
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  placeOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
};

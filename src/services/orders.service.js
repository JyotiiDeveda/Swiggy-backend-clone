const commonHelpers = require('../helpers/common.helper');
const { User, Order, Cart, Dish, Restaurant } = require('../models');
const { sequelize } = require('../models');
const constants = require('../constants/constants');
const mailHelper = require('../helpers/mail.helper');
const ordersHelper = require('../helpers/orders.helper');

const placeOrder = async (currentUser, userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user can access the endpoint
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const { cartId } = payload;

    // check if order is already placed
    const orderDetails = await Order.findOne({
      where: { cart_id: cartId },
      include: {
        model: User,
        where: { id: userId },
      },
    });

    if (orderDetails) {
      throw commonHelpers.customError('Order already placed', 409);
    }

    const cartDishDetails = await Cart.findOne({
      where: { id: cartId, user_id: userId, status: constants.CART_STATUS.ACTIVE },
      include: {
        model: Dish,
        as: 'dishes',
        attributes: ['restaurant_id', 'id', 'price'],
        through: {
          attributes: ['dish_id', 'quantity', 'price'],
        },
      },
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
    });

    if (!cartDishDetails) {
      throw commonHelpers.customError('Cart not found', 404);
    }

    const dishes = cartDishDetails.dishes;

    // check if cart is not empty
    if (!dishes || dishes.length === 0) {
      throw commonHelpers.customError('Cart is empty', 400);
    }

    const cartsRestaurantId = dishes[0].restaurant_id;

    // calculate order charges, delivery charges, total_amt
    let orderCharges = 0;
    dishes.forEach(async dish => {
      orderCharges += dish.CartDish.quantity * dish.price;
    });

    const deliveryCharges = constants.DELIVERY_CHARGES;

    const gst = orderCharges * (constants.GST_RATE / 100);

    const totalCost = orderCharges + deliveryCharges + gst;
    console.log(
      `Order charges: ${orderCharges} deliver charges: ${deliveryCharges} gst: ${gst} total cost: ${totalCost}`
    );

    const order = await Order.create(
      {
        restaurant_id: cartsRestaurantId,
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
    cartDishDetails.status = constants.ORDER_STATUS.LOCKED;
    await cartDishDetails.save({ transaction: transactionContext });

    // send mail
    await mailHelper.sendOrderPlacedMail(currentUser.email, order);
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
  if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }

  const order = await Order.findOne({
    where: { id: orderId },
    include: [
      {
        model: Cart,
        where: {
          user_id: userId,
        },
        include: {
          model: Dish,
          as: 'dishes',
          attributes: {
            exclude: ['created_at', 'updated_at', 'deleted_at'],
          },
        },
      },
      {
        model: Restaurant,
        attributes: ['id', 'name', 'category'],
      },
    ],
  });

  if (!order) throw commonHelpers.customError('No order found', 404);

  return order;
};

const getAllOrders = async (currentUser, userId, queryOptions) => {
  // check if user has the access
  if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }
  const { page = 1, limit = 10 } = queryOptions;

  const offset = (page - 1) * limit;

  const options = {
    attributes: {
      include: [[sequelize.col('Restaurant.name'), constants.ENTITY_TYPE.RESTAURANT]],
      exclude: ['created_at', 'deleted_at', 'updated_at'],
    },

    include: [
      {
        model: Restaurant,
        attributes: [],
        duplicating: false,
      },
      {
        model: Cart,
        where: { user_id: userId },
        attributes: [],
        duplicating: false,
      },
    ],
    offset: offset,
    limit: limit,
  };

  const response = await ordersHelper.getOrders(options, page, limit);

  return response;
};

const deleteOrder = async (currentUser, userId, orderId) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user has the access
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    // an undelivered order can only be deleted
    const order = await Order.findOne({
      where: {
        id: orderId,
        status: constants.ORDER_STATUS.PREPARING,
      },
      include: { model: Cart, where: { user_id: userId } },
    });

    if (!order) {
      throw commonHelpers.customError('No order found', 404);
    }

    // the order which has not been delivered or cancelled can only be deleted
    await Order.destroy({
      where: { id: orderId },
      transaction: transactionContext,
    });

    const associatedCartId = order.cart_id;

    // delete associated cart
    const cart = await Cart.findByPk(associatedCartId);

    if (!cart) {
      throw commonHelpers.customError('Associated cart not found', 404);
    }

    await Cart.destroy({
      where: { id: associatedCartId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting dish', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const getAllUnassignedOrders = async (page, limit) => {
  const offset = (page - 1) * limit;

  const options = {
    where: { status: constants.ORDER_STATUS.PREPARING, delivery_partner_id: null },
    include: {
      model: Restaurant,
    },
    offset: offset,
    limit: limit,
  };

  const response = await ordersHelper.getOrders(options, page, limit);

  return response;
};

const assignOrder = async (currentUser, userId, orderId) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user has the access
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const order = await Order.findOne({ where: { id: orderId, status: constants.ORDER_STATUS.PREPARING } });

    if (!order) {
      throw commonHelpers.customError('No order found', 404);
    }

    const deliveryPartner = await User.findOne({ where: { id: userId } });

    if (!deliveryPartner) {
      throw commonHelpers.customError('Delivery partner not found', 404);
    }

    order.delivery_partner_id = userId;
    await order.save({ transaction: transactionContext });

    const mailOptions = {
      orderId: order.id,
      assignedAt: order.updated_at,
      deliveryPartner: `${deliveryPartner.first_name} ${deliveryPartner.last_name}`,
    };

    await mailHelper.sendOrderAssignedMail(currentUser.email, mailOptions);
    await transactionContext.commit();

    return order;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in assigning order', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const getPendingOrders = async (currentUser, userId, page, limit) => {
  if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }

  const offset = (page - 1) * limit;

  const options = {
    where: { delivery_partner_id: userId, status: constants.ORDER_STATUS.PREPARING },
    offset: offset,
    limit: limit,
  };

  const response = await ordersHelper.getOrders(options, page, limit);

  return response;
};

const updateOrderStatus = async (deliveryPartner, orderId, status) => {
  const transactionContext = await sequelize.transaction();
  try {
    const filter = { id: orderId };

    // if delivery partner is not admin he can update the status of orders assigned to them only
    if (!deliveryPartner.userRoles.includes(constants.ROLES.ADMIN))
      filter.delivery_partner_id = deliveryPartner.userId;

    const order = await Order.findOne({ id: orderId, status: constants.ORDER_STATUS.PREPARING });

    if (!order) {
      throw commonHelpers.customError('No order found', 404);
    }

    order.status = status;
    await order.save({ transaction: transactionContext });

    await mailHelper.sendOrderStatusUpdateMail(deliveryPartner.email, order);
    await transactionContext.commit();

    return order;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in updating order status', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = {
  placeOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getAllUnassignedOrders,
  getPendingOrders,
  assignOrder,
  updateOrderStatus,
};

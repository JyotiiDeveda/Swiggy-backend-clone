const commonHelpers = require('../helpers/common.helper');
const models = require('../models');
const { sequelize } = require('../models');
const constants = require('../constants/constants');
const orderSerializer = require('../serializers/orders.serializer');
const mailHelper = require('../helpers/mail.helper');

const placeOrder = async (currentUser, userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user can access the endpoint
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const { cart_id: cartId, restaurant_id: restaurantId } = payload;

    // check if order is already placed
    const orderDetails = await models.Order.findOne({
      where: { cart_id: cartId, restaurant_id: restaurantId },
    });

    if (orderDetails) {
      throw commonHelpers.customError('Order already placed', 409);
    }

    const cartDishDetails = await models.Cart.findOne({
      where: { id: cartId, status: constants.CART_STATUS.ACTIVE },
      include: {
        model: models.Dish,
        as: 'dishes',
        attributes: ['restaurant_id', 'id', 'quantity', 'price'],
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

    // check if given restaurant id belongs to cart
    if (restaurantId !== cartsRestaurantId) {
      throw commonHelpers.customError('Restaurant does not belong to given cart', 422);
    }

    // check if required quantity is available and update inventory
    for (const dish of dishes) {
      const availableQuantity = dish.quantity;
      const requiredQuantity = dish.CartDish.quantity;

      if (requiredQuantity > availableQuantity)
        commonHelpers.customError('Required quantity not available', 400);
      const [updatedDishCnt] = await models.Dish.update(
        {
          quantity: availableQuantity - requiredQuantity,
        },
        { where: { id: dish.id }, transaction: transactionContext }
      );

      if (!updatedDishCnt || updatedDishCnt === 0)
        throw commonHelpers.customError('Failed to update inventory', 400);
    }

    // calculate order charges, delivery charges, total_amt
    let orderCharges = 0;
    dishes.forEach(async dish => {
      orderCharges += dish.CartDish.quantity * dish.price;
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
  if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const orders = await models.Order.findAll({
    attributes: [
      'id',
      [sequelize.col('Order.created_at'), 'orderDate'],
      [sequelize.col('Restaurant.name'), constants.ENTITY_TYPE.RESTAURANT],
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
  if (!orders || orders.length === 0) {
    throw commonHelpers.customError('No users found', 404);
  }
  return orders;
};

const deleteOrder = async (currentUser, userId, orderId) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user has the access
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    // the order which has not been delivered or cancelled can only be deleted
    const deletedOrder = await models.Order.destroy({
      where: { id: orderId, status: constants.ORDER_STATUS.PREPARING },
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

const getAllUnassignedOrders = async (page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const orders = await models.Order.findAll({
    where: { status: constants.ORDER_STATUS.PREPARING },
    offset: startIndex,
    limit: endIndex,
  });
  if (!orders || orders.length === 0) {
    throw commonHelpers.customError('No orders found', 404);
  }
  return orders;
};

const assignOrder = async (currentUser, userId, orderId) => {
  const transactionContext = await sequelize.transaction();
  try {
    // check if user has the access
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const [updatedOrderCnt, updatedOrder] = await models.Order.update(
      {
        delivery_partner_id: userId,
      },
      {
        where: { id: orderId, status: constants.ORDER_STATUS.PREPARING },
        returning: true,
        transaction: transactionContext,
      }
    );

    if (updatedOrderCnt === 0) {
      throw commonHelpers.customError('No order found', 404);
    }

    const deliveryPartner = await models.User.findOne({ where: { id: userId } });

    const mailOptions = {
      orderId: updatedOrder[0].id,
      assignedAt: updatedOrder[0].updated_at,
      deliveryPartner: `${deliveryPartner.first_name} ${deliveryPartner.last_name}`,
    };

    await mailHelper.sendOrderAssignedMail(currentUser.email, mailOptions);
    await transactionContext.commit();
    return updatedOrder;
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

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const orders = await models.Order.findAll({
    where: { delivery_partner_id: userId, status: constants.ORDER_STATUS.PREPARING },
    offset: startIndex,
    limit: endIndex,
  });
  if (!orders || orders.length === 0) {
    throw commonHelpers.customError('No pending orders found', 404);
  }
  return orders;
};

const updateOrderStatus = async (deliveryPartner, orderId, status) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!status) {
      throw commonHelpers.customError('Status required', 422);
    }

    const filter = { id: orderId };

    // if delivery partner is not admin he can update the status of orders assigned to them only
    if (!deliveryPartner.userRoles.includes(constants.ROLES.ADMIN))
      filter.delivery_partner_id = deliveryPartner.userId;

    const [updatedOrderCnt, updatedOrder] = await models.Order.update(
      {
        status: status,
      },
      { where: filter, returning: true, transaction: transactionContext }
    );

    if (updatedOrderCnt === 0) {
      throw commonHelpers.customError('No order found', 404);
    }
    await mailHelper.sendOrderStatusUpdateMail(deliveryPartner.email, updatedOrder[0]);
    await transactionContext.commit();
    return updatedOrder;
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

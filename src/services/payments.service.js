const commonHelpers = require('../helpers/common.helper');
const paymentsHelper = require('../helpers/payments.helper');
const models = require('../models');
const { sequelize } = require('../models');

const makePayment = async (userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { orderId, type } = payload;
    // check if an unplaced order exists
    const orderExists = await models.Order.findOne({
      where: {
        id: orderId,
        status: 'preparing',
      },
      include: {
        model: models.Cart,
        where: {
          user_id: userId,
        },
      },
    });

    if (!orderExists) {
      throw commonHelpers.customError('Order not found', 404);
    }

    // ensure payment is not done already
    const payment = await models.Payment.findOne({
      where: { order_id: orderId, user_id: userId },
    });

    if (payment) {
      throw commonHelpers.customError('Payment done already', 409);
    }

    const totalCost = orderExists.total_amount;
    const response = await paymentsHelper.pay(totalCost);

    if (!response) throw commonHelpers.customError('Payment failed', 400);

    const newPayment = await models.Payment.create(
      {
        user_id: userId,
        order_id: orderId,
        total_amount: totalCost,
        type,
        status: 'successfull',
      },
      { transaction: transactionContext }
    );

    if (!newPayment) {
      throw commonHelpers.customError('Error in payment', 400);
    }

    await transactionContext.commit();
    return newPayment;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in making Payment', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = { makePayment };

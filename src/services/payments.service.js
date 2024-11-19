const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');
const paymentsHelper = require('../helpers/payments.helper');
const models = require('../models');
const { sequelize } = require('../models');
const mailHelper = require('../helpers/mail.helper');

const makePayment = async (currentUser, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    const { userId, email } = currentUser;
    const { orderId, type } = payload;
    // check if an unplaced order exists

    const orderExists = await models.Order.findOne({
      where: {
        id: orderId,
        status: constants.ORDER_STATUS.PREPARING,
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
        status: constants.PAYMENT_STATUS.SUCCESSFUL,
      },
      { transaction: transactionContext }
    );

    if (!newPayment) {
      throw commonHelpers.customError('Error in payment', 400);
    }

    await mailHelper.sendPaymentStatusMail(email, orderId, newPayment);
    await transactionContext.commit();
    return newPayment;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in making Payment', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const getAllPayments = async (userId, page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const payments = await models.Payment.findAll({
    where: { user_id: userId },
    offset: startIndex,
    limit: endIndex,
  });
  if (!payments || payments.length === 0)
    throw commonHelpers.customError('No payments found for the user', 404);

  return payments;
};

module.exports = { makePayment, getAllPayments };

const commonHelper = require('../helpers/common.helper');
const paymentServices = require('../services/payments.service');

const makePayment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const payload = req.body;
    const payment = await paymentServices.makePayment(currentUser, payload);

    res.statusCode = 201;
    res.data = payment;
    res.message = 'Payment successfull';

    next();
  } catch (err) {
    console.log('Error in making payment: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { page, limit } = req.query;
    const allPayments = await paymentServices.getAllPayments(userId, page, limit);

    res.statusCode = 200;
    res.data = allPayments;
    res.message = 'Fetched all payments successfully';

    next();
  } catch (err) {
    console.log('Error in getting payment: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { makePayment, getAll };

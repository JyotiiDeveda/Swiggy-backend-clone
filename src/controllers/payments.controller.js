const commonHelper = require('../helpers/common.helper');
const paymentServices = require('../services/payments.service');

const makePayment = async (req, res) => {
  try {
    const { userId } = req.user;
    const payload = req.body;
    const payment = await paymentServices.makePayment(userId, payload);
    return commonHelper.customResponseHandler(res, 'Payment successfull', 201, payment);
  } catch (err) {
    console.log('Error in making payment: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page, limit } = req.query;
    const allPayments = await paymentServices.getAllPayments(userId, page, limit);
    return commonHelper.customResponseHandler(res, 'Fetched all payments successfully', 201, allPayments);
  } catch (err) {
    console.log('Error in getting payment: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { makePayment, getAll };

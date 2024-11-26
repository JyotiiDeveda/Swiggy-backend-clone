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

module.exports = { makePayment };

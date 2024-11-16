const commonHelper = require('../helpers/common.helper');
const paymentServices = require('../services/payments.service');

const makePayment = async (req, res) => {
  try {
    const { userId } = req.user;
    const payload = req.body;
    const updatedCart = await paymentServices.makePayment(userId, payload);
    return commonHelper.customResponseHandler(res, 'Payment successfull', 201, updatedCart);
  } catch (err) {
    console.log('Error in making payment: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { makePayment };

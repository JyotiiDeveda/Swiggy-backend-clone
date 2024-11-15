const cartServices = require('../services/carts.service');
const commonHelper = require('../helpers/common.helper');

const addItem = async (req, res) => {
  try {
    const { userId } = req.user;
    const payload = req.body;
    const updatedCart = await cartServices.addItem(userId, payload);
    return commonHelper.customResponseHandler(res, 'Added dish to cart successfully', 201, updatedCart);
  } catch (err) {
    console.log('Error in adding dish to cart: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  addItem,
};

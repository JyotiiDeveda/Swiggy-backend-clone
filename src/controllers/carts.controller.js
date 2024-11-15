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

const removeItem = async (req, res) => {
  try {
    const cartId = req.params['cartId'];
    const dishId = req.params['dishId'];
    await cartServices.removeItem(cartId, dishId);
    return commonHelper.customResponseHandler(res, 'Removed dish from cart successfully', 204);
  } catch (err) {
    console.log('Error in removing dish from cart: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const emptyCart = async (req, res) => {
  try {
    const cartId = req.params['id'];
    await cartServices.emptyCart(cartId);
    return commonHelper.customResponseHandler(res, 'Cart emptied successfully', 204);
  } catch (err) {
    console.log('Error in emptying cart: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  addItem,
  removeItem,
  emptyCart,
};

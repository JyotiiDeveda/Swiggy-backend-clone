const cartServices = require('../services/carts.service');
const commonHelper = require('../helpers/common.helper');

const addItem = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const payload = req.body;
    const updatedCart = await cartServices.addItem(userId, payload);
    res.statusCode = 201;
    res.data = updatedCart;
    res.message = 'Added dish to cart successfully';
    next();
  } catch (err) {
    console.log('Error in adding dish to cart: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const cartId = req.params['cartId'];
    const dishId = req.params['dishId'];
    const { userId } = req.user;
    await cartServices.removeItem(userId, cartId, dishId);
    res.statusCode = 204;
    res.message = 'Dish removed from cart';
    next();
  } catch (err) {
    console.log('Error in removing dish from cart: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const emptyCart = async (req, res, next) => {
  try {
    const cartId = req.params['id'];
    const userId = req.user.userId;
    await cartServices.emptyCart(userId, cartId);
    res.statusCode = 204;
    next();
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

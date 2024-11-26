const cartServices = require('../services/carts.service');
const commonHelper = require('../helpers/common.helper');

const getCartDishes = async (req, res, next) => {
  try {
    const cartId = req.params['id'];
    const { userId } = req.user;
    const cartDishes = await cartServices.getCartDishes(cartId, userId);

    res.statusCode = 200;
    res.data = cartDishes;
    res.message = 'Fetched cart dishes successfully';

    next();
  } catch (err) {
    console.log('Error in getting cart dishes: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const addItem = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const payload = req.body;
    const cartDish = await cartServices.addItem(userId, payload);

    res.statusCode = 201;
    res.message = 'Added dish to cart successfully';
    res.data = cartDish;

    next();
  } catch (err) {
    console.log('Error in adding dish to cart: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const removeItem = async (req, res, next) => {
  try {
    const payload = req.params;
    const { userId } = req.user;
    await cartServices.removeItem(userId, payload);

    res.statusCode = 204;
    res.message = 'Dish removed from cart';

    next();
  } catch (err) {
    console.log('Error in removing dish from cart: ', err);
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
    console.log('Error in emptying cart: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  getCartDishes,
  addItem,
  removeItem,
  emptyCart,
};

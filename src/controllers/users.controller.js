const userServices = require('../services/users.service');
const commonHelper = require('../helpers/common.helper');
const orderServices = require('../services/orders.service');

const addAddress = async (req, res, next) => {
  try {
    const { address } = req.body;
    const userId = req.params['id'];
    const currentUser = req.user;
    const updatedUser = await userServices.addAddress(currentUser, userId, address);

    res.statusCode = 200;
    res.message = 'Address updated successfully';
    res.data = updatedUser;

    next();
  } catch (err) {
    console.log('Error in updating address: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const addDeliveryPartner = async (req, res, next) => {
  try {
    const userId = req.params['userId'];
    const roleId = req.params['roleId'];
    const currentUser = req.user;

    await userServices.assignRole(currentUser, userId, roleId);

    res.statusCode = 201;
    res.message = 'Added delivery partner successfully';

    next();
  } catch (err) {
    console.log('Error in adding delivery partner: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const removeAccount = async (req, res, next) => {
  try {
    const userId = req.params['id'];
    const currentUser = req.user;

    await userServices.removeAccount(currentUser, userId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting user: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const get = async (req, res, next) => {
  try {
    const userId = req.params['id'];
    const currentUser = req.user;

    const userDetails = await userServices.get(currentUser, userId);

    res.statusCode = 200;
    res.message = 'Fetched user details successfully';
    res.data = userDetails;

    next();
  } catch (err) {
    console.log('Error in getting the user details: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const getAll = async (req, res, next) => {
  try {
    const queryOptions = req.query;
    const users = await userServices.getAll(queryOptions);

    res.statusCode = 200;
    res.message = 'Fetched users successfully';
    res.data = users;

    next();
  } catch (err) {
    console.log('Error in getting the user details: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const placeOrder = async (req, res, next) => {
  try {
    const userId = req.params['id'];
    const currentUser = req.user;
    const order = await orderServices.placeOrder(currentUser, userId, req.body);

    res.statusCode = 200;
    res.message = 'Placed order successfully';
    res.data = order;

    next();
  } catch (err) {
    console.log('Error in placing order: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const userId = req.params['userId'];
    const orderId = req.params['orderId'];
    const currentUser = req.user;
    const order = await orderServices.getOrder(currentUser, userId, orderId);

    res.statusCode = 200;
    res.message = 'Fetched order successfully';
    res.data = order;

    next();
  } catch (err) {
    console.log('Error in getting order: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params['id'];
    const currentUser = req.user;
    const users = await orderServices.getAllOrders(currentUser, userId, page, limit);

    res.statusCode = 200;
    res.message = "Fetched user's orders successfully";
    res.data = users;

    next();
  } catch (err) {
    console.log("Error in getting the user's order details: ", err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const userId = req.params['userId'];
    const orderId = req.params['orderId'];
    const currentUser = req.user;
    await orderServices.deleteOrder(currentUser, userId, orderId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting order: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getPendingOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const deliveryPartnerId = req.params['id'];
    const currentUser = req.user;
    const orders = await orderServices.getPendingOrders(currentUser, deliveryPartnerId, page, limit);

    res.statusCode = 200;
    res.message = "Fetched delivery partner's pending orders successfully";
    res.data = orders;

    next();
  } catch (err) {
    console.log('Error in getting the pending orders: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  addAddress,
  addDeliveryPartner,
  removeAccount,
  get,
  getAll,
  placeOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getPendingOrders,
};

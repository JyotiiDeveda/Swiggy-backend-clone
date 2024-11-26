const userServices = require('../services/users.service');
const commonHelper = require('../helpers/common.helper');
const orderServices = require('../services/orders.service');

const create = async (req, res, next) => {
  try {
    const payload = req.body;
    const updatedUser = await userServices.create(payload);

    res.statusCode = 201;
    res.message = 'User created successfully';
    res.data = updatedUser;

    next();
  } catch (err) {
    console.log('Error in creating user: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const userId = req.params['id'];
    const payload = req.body;
    const updatedUser = await userServices.updateProfile(req.user, userId, payload);

    res.statusCode = 200;
    res.message = 'User profile updated successfully';
    res.data = updatedUser;

    next();
  } catch (err) {
    console.log('Error in updating user profile: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const assignRole = async (req, res, next) => {
  try {
    const userId = req.params['userId'];
    const currentUser = req.user;
    const { roleId } = req.body;

    await userServices.assignRole(currentUser, userId, roleId);

    res.statusCode = 201;
    res.message = 'Assigned role successfully';

    next();
  } catch (err) {
    console.log('Error in assigning role: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
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
    console.log('Error in deleting user: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const get = async (req, res, next) => {
  try {
    let userId = req.params?.id ? req.params.id : req.user.userId;

    const userDetails = await userServices.get(userId);

    res.statusCode = 200;
    res.message = 'Fetched user details successfully';
    res.data = userDetails;

    return next();
  } catch (err) {
    console.log('Error in getting the user details: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
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
    console.log('Error in getting the user details: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
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
    console.log('Error in placing order: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getOrder = async (req, res, next) => {
  try {
    const params = req.params;
    const currentUser = req.user;

    const order = await orderServices.getOrder(currentUser, params);

    res.statusCode = 200;
    res.message = 'Fetched order successfully';
    res.data = order;

    next();
  } catch (err) {
    console.log('Error in getting order: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const queryOptions = req.query;
    const userId = req.params['id'];
    const currentUser = req.user;

    const orders = await orderServices.getAllOrders(currentUser, userId, queryOptions);

    res.statusCode = 200;
    res.message = "Fetched user's orders successfully";
    res.data = orders;

    next();
  } catch (err) {
    console.log("Error in getting the user's order details: ", err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const params = req.params;
    const currentUser = req.user;

    await orderServices.deleteOrder(currentUser, params);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting order: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getPendingOrders = async (req, res, next) => {
  try {
    const queryOptions = req.query;
    const deliveryPartnerId = req.params['id'];
    const currentUser = req.user;

    const orders = await orderServices.getPendingOrders(currentUser, deliveryPartnerId, queryOptions);

    res.statusCode = 200;
    res.message = "Fetched delivery partner's pending orders successfully";
    res.data = orders;

    next();
  } catch (err) {
    console.log('Error in getting the pending orders: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  create,
  updateProfile,
  assignRole,
  removeAccount,
  get,
  getAll,
  placeOrder,
  getOrder,
  getAllOrders,
  deleteOrder,
  getPendingOrders,
};

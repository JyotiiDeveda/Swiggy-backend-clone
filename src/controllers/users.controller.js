const userServices = require('../services/users.service');
const commonHelper = require('../helpers/common.helper');
const orderServices = require('../services/orders.service');

const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.params['id'];
    await userServices.addAddress(userId, address);
    return commonHelper.customResponseHandler(res, 'Address updated successfully', 204);
  } catch (err) {
    console.log('Error in updating address: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

// admin can assign a delivery partner role to a reistered user
const addDeliveryPartner = async (req, res) => {
  try {
    const userId = req.params['userid'];
    const roleId = req.params['roleid'];

    await userServices.assignRole(userId, roleId);
    return commonHelper.customResponseHandler(res, 'Added delivery partner successfully', 201);
  } catch (err) {
    console.log('Error in adding delivery partner: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const removeAccount = async (req, res) => {
  try {
    const userId = req.params['id'];
    await userServices.removeAccount(userId);
    return commonHelper.customResponseHandler(res, 'Deleted user successfully', 204);
  } catch (err) {
    console.log('Error in deleting user: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const get = async (req, res) => {
  try {
    const userId = req.params['id'];
    const userDetails = await userServices.get(userId);
    return commonHelper.customResponseHandler(res, 'Fetched user details successfully', 200, userDetails);
  } catch (err) {
    console.log('Error in getting the user details: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const users = await userServices.getAll(page, limit);
    return commonHelper.customResponseHandler(res, 'Fetched users successfully', 200, users);
  } catch (err) {
    console.log('Error in getting the user details: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
  }
};

const placeOrder = async (req, res) => {
  try {
    const userId = req.params['id'];
    const currentUser = req.user;
    const order = await orderServices.placeOrder(currentUser, userId, req.body);
    return commonHelper.customResponseHandler(res, 'Placed order successfully', 200, order);
  } catch (err) {
    console.log('Error in placing order: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getOrder = async (req, res) => {
  try {
    const userId = req.params['userId'];
    const orderId = req.params['orderId'];
    const currentUser = req.user;
    const order = await orderServices.getOrder(currentUser, userId, orderId);
    return commonHelper.customResponseHandler(res, 'Fetched order successfully', 200, order);
  } catch (err) {
    console.log('Error in getting order: ', err.message);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params['id'];
    const currentUser = req.user;
    const users = await orderServices.getAllOrders(currentUser, userId, page, limit);
    return commonHelper.customResponseHandler(res, "Fetched user's orders successfully", 200, users);
  } catch (err) {
    console.log("Error in getting the user's order details: ", err.message);
    return commonHelper.customErrorHandler(res, err.message, 400);
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
};

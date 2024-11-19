const commonHelper = require('../helpers/common.helper');
const orderServices = require('../services/orders.service');

// all the orders that are yet to get assigned to a delivery partner
const getAllUnassignedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const orders = await orderServices.getAllUnassignedOrders(page, limit);
    return commonHelper.customResponseHandler(res, 'Fetched unassigned orders successfully', 200, orders);
  } catch (err) {
    console.log('Error in getting unassigned orders: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const assignOrder = async (req, res) => {
  try {
    const orderId = req.params['id'];

    // delivery partner can assign order to themselves
    const currentUser = req.user;
    // the userId(i.e delivery partner) which is supposed to be assigned an order
    const { userId } = req.body;

    const orders = await orderServices.assignOrder(currentUser, userId, orderId);
    return commonHelper.customResponseHandler(res, 'Assigned order successfully', 200, orders);
  } catch (err) {
    console.log('Error in assigning order to delivery partner: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params['id'];
    const deliveryPartner = req.user;
    const { status } = req.body;

    const orders = await orderServices.updateOrderStatus(deliveryPartner, orderId, status);
    return commonHelper.customResponseHandler(res, 'Updated order status successfully', 200, orders);
  } catch (err) {
    console.log('Error in updating order status: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = {
  getAllUnassignedOrders,
  assignOrder,
  updateOrderStatus,
};

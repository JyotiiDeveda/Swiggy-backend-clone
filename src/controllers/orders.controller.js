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

module.exports = {
  getAllUnassignedOrders,
};

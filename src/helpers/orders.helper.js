const { Order } = require('../models');
const commonHelpers = require('../helpers/common.helper');

const getOrders = async (options, page, limit) => {
  const ordersData = await Order.findAndCountAll(options);

  // console.log('ORDERS: ', ordersData);

  const ordersCount = ordersData?.count;

  if (!ordersCount || ordersCount === 0) {
    throw commonHelpers.customError('Orders not found', 404);
  }

  const response = {
    rows: ordersData?.rows,
    pagination: {
      totalRecords: ordersCount,
      currentPage: parseInt(page),
      recordsPerPage: parseInt(limit),
      noOfPages: Math.ceil(ordersCount / limit),
    },
  };

  return response;
};

module.exports = { getOrders };

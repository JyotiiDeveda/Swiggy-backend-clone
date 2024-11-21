const serializeOrder = (req, res, next) => {
  let { rows } = res.data;
  let orders = [];

  if (!rows) {
    rows = Array.isArray(res.data) ? res.data : [res.data];
  }

  for (const order of rows) {
    const serializedOrder = {
      id: order.id,
      restaurant: order?.dataValues?.restaurant || order?.Restaurant?.name,
      orderDate: order?.created_at,
      deliveryCharges: order?.delivery_charges,
      orderCharges: order?.order_charges,
      gst: order?.gst,
      totalAmount: order?.total_amount,
      status: order?.status,
      createdAt: order?.created_at,
      updatedAt: order?.updated_at,
    };

    orders.push(serializedOrder);
  }

  res.data = { orders };

  next();
};

module.exports = {
  serializeOrder,
};

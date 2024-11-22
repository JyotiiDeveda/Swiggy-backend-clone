const serializeOrders = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  const orders = rows.map(order => ({
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
  }));

  res.data = isSingleItem ? { order: orders[0] } : { orders };

  next();
};

module.exports = {
  serializeOrders,
};

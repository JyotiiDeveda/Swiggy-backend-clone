const serializeOrders = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  if (isSingleItem) {
    rows = [rows];
  }

  const response = { pagination: res.data?.pagination };

  const orders = rows.map(order => ({
    id: order.id,
    restaurant: {
      id: order?.restaurant_id,
      name: order?.dataValues?.restaurant || order?.Restaurant?.name,
    },
    orderDate: new Date(order?.created_at).toLocaleDateString('en-CA'),
    deliveryCharges: order?.delivery_charges,
    orderCharges: order?.order_charges,
    gst: order?.gst,
    totalAmount: order?.total_amount,
    status: order?.status,
    deliveryPartnerId: order?.delivery_partner_id,
    createdAt: order?.created_at,
    updatedAt: order?.updated_at,
  }));

  const orderedDishes = rows[0]?.Cart?.dishes;

  if (isSingleItem && orderedDishes) {
    const dishes = orderedDishes.map(dish => {
      return {
        id: dish?.id,
        name: dish?.name,
        price: dish?.price,
        quantity: dish?.CartDish?.quantity,
        dishCost: dish?.price * dish?.CartDish?.quantity,
      };
    });
    orders[0].dishes = dishes;
  }

  isSingleItem ? (response.order = orders[0]) : (response.orders = orders);

  res.data = response;

  next();
};

module.exports = {
  serializeOrders,
};

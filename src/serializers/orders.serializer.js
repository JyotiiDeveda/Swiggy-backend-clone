const serializeOrder = data => {
  const serializedOrder = {
    restaurant: data?.Restaurant?.name,
    restaurantType: data?.Restaurant?.category,
    orderDate: data.created_at,
    deliveryCharges: data?.delivery_charges,
    orderCharges: data.order_charges,
    gst: data.gst,
    totalAmount: data.total_amount,
    status: data.status,
  };

  const dishes = data?.Cart?.dishes;

  const orderedDishes = [];

  dishes.forEach(dish => {
    const serializedDish = {
      id: dish.id,
      name: dish.name,
      price: dish.price,
      type: dish.type,
      quantity: dish.CartDish.quantity,
    };
    orderedDishes.push(serializedDish);
  });

  serializedOrder.dishes = orderedDishes;
  // console.log('Serialized order: ', serializedOrder);

  return serializedOrder;
};

module.exports = {
  serializeOrder,
};

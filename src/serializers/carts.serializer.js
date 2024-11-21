const serializeCartDishes = (req, res, next) => {
  let { rows } = res.data;

  if (!rows) {
    rows = res.data;
  }

  const cart = {
    id: rows.id,
    userId: rows.user_id,
    restaurant: rows?.dishes[0]?.Restaurant?.name,
    restaurantType: rows?.dishes[0]?.Restaurant?.category,
  };

  const dishes = [];
  const cartDishes = rows?.dishes;

  for (const dish of cartDishes) {
    const dishData = {
      id: dish.id,
      name: dish.name,
      description: dish.description,
      imageUrl: dish.image_url,
      price: dish.price,
      quantity: dish?.CartDish?.quantity,
    };

    dishes.push(dishData);
  }
  cart.dishes = dishes;

  res.data = { cart };
  next();
};

module.exports = {
  serializeCartDishes,
};

const serializeRestaurants = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  const response = { pagination: res.data?.pagination };

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  const restaurants = rows.map(restaurant => ({
    id: restaurant.id,
    name: restaurant.name,
    description: restaurant?.description,
    totalAmount: restaurant?.total_amount,
    averageRating: restaurant?.dataValues?.averageRating,
    ratingsCount: restaurant?.dataValues?.ratings_cnt,
    type: restaurant?.category,
    address: restaurant?.address,
    imageUrl: restaurant?.image_url,
    createdAt: restaurant?.created_at,
    updatedAt: restaurant?.updated_at,
  }));

  const restaurantDishes = rows[0]?.dishes;

  if (isSingleItem && restaurantDishes) {
    console.log('IS SINGLE: ', isSingleItem);
    const dishes = restaurantDishes.map(dish => {
      return {
        name: dish?.name,
        description: dish?.description,
        imageUrl: dish?.image_url,
        price: dish?.price,
      };
    });
    restaurants[0].dishes = dishes;
  }
  isSingleItem ? (response.restaurant = restaurants[0]) : (response.restaurants = restaurants);
  res.data = response;
  next();
};

module.exports = {
  serializeRestaurants,
};

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
    averageRating: restaurant?.dataValues?.avg_rating,
    ratingsCount: restaurant?.dataValues?.ratings_cnt,
    category: restaurant?.category,
    address: restaurant?.address,
    imageUrl: restaurant?.image_url,
    createdAt: restaurant?.created_at,
    updatedAt: restaurant?.updated_at,
  }));

  isSingleItem ? (response.restaurant = restaurants[0]) : (response.restaurants = restaurants);
  res.data = response;
  next();
};

module.exports = {
  serializeRestaurants,
};

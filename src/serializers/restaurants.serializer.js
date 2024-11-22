const serializeRestaurants = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

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

  res.data = isSingleItem ? { restaurant: restaurants[0] } : { restaurants };

  next();
};

module.exports = {
  serializeRestaurants,
};

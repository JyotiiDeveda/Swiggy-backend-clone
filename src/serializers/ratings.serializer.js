const serializeRatings = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  const ratings = rows.map(rating => ({
    id: rating?.id,
    userId: rating?.user_id,
    restaurantId: rating?.restaurant_id,
    dishId: rating?.dish_id,
    entityType: rating?.entity_type,
    ratingScore: rating?.rating,
    createdAt: rating?.created_at,
    updatedAt: rating?.updated_at,
  }));

  res.data = isSingleItem ? { rating: ratings[0] } : { ratings };

  next();
};

module.exports = {
  serializeRatings,
};

const serializeDishes = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  const dishes = rows.map(dish => ({
    id: dish?.id,
    name: dish?.name,
    description: dish?.description,
    imageUrl: dish?.image_url,
    type: dish?.type,
    price: dish?.price,
    averageRating: dish?.dataValues?.avg_rating,
    ratingsCount: dish?.dataValues?.ratings_cnt,
    createdAt: dish?.created_at,
    updatedAt: dish?.updated_at,
  }));

  res.data = isSingleItem ? { dish: dishes[0] } : { dishes };

  next();
};

module.exports = {
  serializeDishes,
};

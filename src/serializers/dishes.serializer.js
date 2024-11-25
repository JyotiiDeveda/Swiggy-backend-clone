const serializeDishes = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  const isSingleItem = !Array.isArray(rows);

  const response = { pagination: res.data?.pagination };

  if (isSingleItem) {
    rows = [rows];
  }

  const dishes = rows.map(dish => ({
    id: dish?.id,
    name: dish?.name,
    description: dish?.description,
    imageUrl: dish?.image_url,
    type: dish?.type,
    price: dish?.price,
    averageRating: dish?.dataValues?.averageRating,
    ratingsCount: dish?.dataValues?.ratingsCount,
    createdAt: dish?.created_at,
    updatedAt: dish?.updated_at,
  }));

  isSingleItem ? (response.dish = dishes[0]) : (response.dishes = dishes);

  res.data = response;

  next();
};

module.exports = {
  serializeDishes,
};

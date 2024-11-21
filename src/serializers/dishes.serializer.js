const serializeDishes = (req, res, next) => {
  let { rows } = res.data;

  if (!rows) {
    rows = Array.isArray(res.data) ? res.data : [res.data];
  }
  let dishes = [];

  console.log('RESPONSE DATA: ', res.data);
  console.log('RESPONSE DATA TYPE: ', typeof rows);

  for (const dish of rows) {
    const dishData = {
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
    };

    dishes.push(dishData);
  }

  res.data = { dishes };
  next();
};

module.exports = {
  serializeDishes,
};

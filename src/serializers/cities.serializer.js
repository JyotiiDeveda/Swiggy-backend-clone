const serializeCities = (req, res, next) => {
  let rows = res.data?.rows || res.data;

  const isSingleItem = !Array.isArray(rows);

  if (isSingleItem) {
    rows = [rows];
  }

  const cities = rows.map(city => {
    const cityData = {
      id: city?.id,
      name: city?.name,
    };
    return cityData;
  });

  res.data = isSingleItem ? { city: cities[0] } : { cities };

  next();
};

module.exports = {
  serializeCities,
};

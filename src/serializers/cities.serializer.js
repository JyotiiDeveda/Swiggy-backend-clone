const serializeCities = (req, res, next) => {
  let rows = res.data?.rows || res.data;

  const response = { pagination: res?.data?.pagination };

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

  isSingleItem ? (response.city = cities[0]) : (response.cities = cities);

  res.data = response;

  next();
};

module.exports = {
  serializeCities,
};

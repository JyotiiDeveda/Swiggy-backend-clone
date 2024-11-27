const { City } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');

const create = async city => {
  const cityExists = await City.findOne({ where: { name: { [Op.iLike]: city } } });

  if (cityExists) {
    throw commonHelpers.customError('City already exists', 409);
  }

  const newCity = await City.create({
    name: city,
  });

  if (!newCity) throw commonHelpers.customError('Failed to create new City', 400);

  return newCity;
};

const getAll = async () => {
  const cities = await City.findAll();

  if (!cities || cities.length === 0) {
    throw commonHelpers.customError('No cities found', 404);
  }

  return cities;
};

const remove = async cityId => {
  const city = await City.findByPk(cityId);

  if (!city) {
    throw commonHelpers.customError('City not found', 404);
  }

  await City.destroy({
    where: { id: cityId },
  });

  return;
};

module.exports = { create, getAll, remove };

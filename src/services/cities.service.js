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

const getAll = async queryOptions => {
  const { page = 1, limit = 10 } = queryOptions;

  const offset = (page - 1) * limit;

  const { count, rows: cities } = await City.findAndCountAll({
    order: [['name', 'ASC']],
    offset: offset,
    limit: limit,
  });

  // console.log('Cities: ', count, cities);
  if (!cities || count === 0) {
    throw commonHelpers.customError('No cities found', 404);
  }

  const response = {
    rows: cities,
    pagination: {
      totalRecords: count,
      currentPage: parseInt(page),
      recordsPerPage: parseInt(limit),
      noOfPages: Math.ceil(count / limit),
    },
  };

  return response;
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

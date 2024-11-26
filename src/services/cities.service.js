const { City, sequelize } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');

const create = async city => {
  const transactionContext = await sequelize.transaction();
  try {
    const cityExists = await City.findOne({ where: { name: { [Op.iLike]: city } } });

    if (cityExists) {
      throw commonHelpers.customError('City already exists', 409);
    }

    const newCity = await City.create(
      {
        name: city,
      },
      { transaction: transactionContext }
    );

    if (!newCity) throw commonHelpers.customError('Failed to create new City', 400);

    await transactionContext.commit();
    return newCity;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in creating City', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const getAll = async () => {
  const cities = await City.findAll();

  if (!cities || cities.length === 0) {
    throw commonHelpers.customError('No cities found', 404);
  }

  return cities;
};

const remove = async cityId => {
  const transactionContext = await sequelize.transaction();
  try {
    const city = await City.findByPk(cityId);

    if (!city) {
      throw commonHelpers.customError('City not found', 404);
    }

    await City.destroy({
      where: { id: cityId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting City', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = { create, getAll, remove };

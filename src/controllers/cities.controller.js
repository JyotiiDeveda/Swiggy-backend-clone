const citiesService = require('../services/cities.service');
const commonHelper = require('../helpers/common.helper');

const create = async (req, res, next) => {
  try {
    const { city } = req.body;
    const createdRole = await citiesService.create(city);

    res.statusCode = 201;
    res.message = 'City added successfully';
    res.data = createdRole;

    next();
  } catch (err) {
    console.log('Error in creating city entry: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res, next) => {
  try {
    const roles = await citiesService.getAll();

    res.statusCode = 200;
    res.message = 'Fetched roles successfully';
    res.data = roles;

    next();
  } catch (err) {
    console.log('Error in getting the cities: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const remove = async (req, res, next) => {
  try {
    const cityId = req.params['id'];
    console.log('CITY: ', cityId);

    await citiesService.remove(cityId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting city: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { create, getAll, remove };

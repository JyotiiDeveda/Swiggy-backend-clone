const rolesService = require('../services/roles.service');
const commonHelper = require('../helpers/common.helper');

const create = async (req, res, next) => {
  try {
    const { role } = req.body;
    const createdRole = await rolesService.create(role);

    res.statusCode = 201;
    res.message = 'Role created successfully';
    res.data = createdRole;

    next();
  } catch (err) {
    console.log('Error in creating role: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const getAll = async (req, res, next) => {
  try {
    const roles = await rolesService.getAll();

    res.statusCode = 200;
    res.message = 'Fetched roles successfully';
    res.data = roles;

    next();
  } catch (err) {
    console.log('Error in getting the user details: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

const remove = async (req, res, next) => {
  try {
    const roleId = req.params['id'];

    await rolesService.remove(roleId);

    res.statusCode = 204;

    next();
  } catch (err) {
    console.log('Error in deleting role: ', err);
    return commonHelper.customErrorHandler(res, err.message, err.statusCode);
  }
};

module.exports = { create, getAll, remove };

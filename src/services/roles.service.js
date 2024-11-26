const { Role } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');

const create = async role => {
  const roleExists = await Role.findOne({ where: { name: { [Op.iLike]: role } } });

  if (roleExists) {
    throw commonHelpers.customError('Role already exists', 409);
  }

  const newRole = await Role.create({ name: role });

  if (!newRole) throw commonHelpers.customError('Failed to create new role', 400);

  return newRole;
};

const getAll = async () => {
  const roles = await Role.findAll();

  if (!roles || roles.length === 0) {
    throw commonHelpers.customError('No roles found', 404);
  }

  return roles;
};

const remove = async roleId => {
  const role = await Role.findByPk(roleId);

  if (!role) {
    throw commonHelpers.customError('Role not found', 404);
  }

  await Role.destroy({
    where: { id: roleId },
  });

  return;
};

module.exports = { create, getAll, remove };

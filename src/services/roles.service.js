const { Role, sequelize } = require('../models');
const { Op } = require('sequelize');
const commonHelpers = require('../helpers/common.helper');

const create = async role => {
  const transactionContext = await sequelize.transaction();
  try {
    const roleExists = await Role.findOne({ where: { name: { [Op.iLike]: role } } });

    if (roleExists) {
      throw commonHelpers.customError('Role already exists', 409);
    }

    const newRole = await Role.create(
      {
        name: role,
      },
      { transaction: transactionContext }
    );

    if (!newRole) throw commonHelpers.customError('Failed to create new role', 400);

    await transactionContext.commit();
    return newRole;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in creating role', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const getAll = async () => {
  const roles = await Role.findAll();

  if (!roles || roles.length === 0) {
    throw commonHelpers.customError('No roles found', 404);
  }

  return roles;
};

const remove = async roleId => {
  const transactionContext = await sequelize.transaction();
  try {
    const role = await Role.findByPk(roleId);

    if (!role) {
      throw commonHelpers.customError('Role not found', 404);
    }

    await Role.destroy({
      where: { id: roleId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting role', err);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

module.exports = { create, getAll, remove };

const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');
const { Op } = require('sequelize');
const models = require('../models');
const { sequelize } = require('../models');

const create = async data => {
  const transactionContext = await sequelize.transaction();
  try {
    const { first_name, last_name, email, phone, address } = data;
    const userExists = await models.User.findOne({
      where: { [Op.or]: [{ email }, { phone }] },
      paranoid: false,
    });

    // if user exists actively
    if (userExists && userExists.deleted_at === null) {
      throw commonHelpers.customError(
        'User with given credentials already exists (email and phone number should be unique)',
        409
      );
    } else if (userExists?.deleted_at) {
      // if soft deleted user exists with same credentials, activate the user
      const [restoredUser] = await models.User.restore({
        where: { email, phone },
        returning: true,
        transaction: transactionContext,
      });
      if (!restoredUser) throw commonHelpers.customError('Credentials should be unique', 409);
      await transactionContext.commit();
      return restoredUser;
    }

    // Creating a user
    const newUser = models.User.build({
      first_name,
      last_name,
      email,
      phone,
    });

    newUser.address = address ? address : null;
    await newUser.save({ transaction: transactionContext });

    // a user can signup with customer role only
    const roleDetails = await models.Role.findOne({ where: { name: constants.ROLES.CUSTOMER } });

    // assign role to user
    const userRole = await models.UserRole.findOrCreate({
      where: {
        user_id: newUser.id,
        role_id: roleDetails.id,
      },
      transaction: transactionContext,
    });

    if (!userRole) throw commonHelpers.customError('Failed to assign user role', 400);

    await transactionContext.commit();
    return newUser;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in creating user', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const assignRole = async (currentUser, userId, roleId) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }
    // a user can signup with customer role only
    const roleDetails = await models.Role.findOne({ where: { id: roleId } });

    if (!roleDetails) {
      throw commonHelpers.customError('Role does not exist', 404);
    }

    const usersRole = {
      user_id: userId,
      role_id: roleDetails.id,
    };

    const userRole = await models.UserRole.findOrCreate({
      where: usersRole,
      transaction: transactionContext,
    });
    if (!userRole) {
      commonHelpers.customError('Failed to assign role', 400);
    }
    console.log('Assigned role successfully');
    await transactionContext.commit();
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error while adding delivery partner', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const addAddress = async (currentUser, userId, address) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const [updatedCnt, updatedUser] = await models.User.update(
      { address: address },
      { where: { id: userId }, returning: true, transaction: transactionContext }
    );
    if (updatedCnt === 0) {
      throw commonHelpers.customError('No user found', 404);
    }
    await transactionContext.commit();
    return updatedUser;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error while updating address', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const removeAccount = async (currentUser, userId) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }
    const deletedCount = await models.User.destroy({
      where: { id: userId },
      transaction: transactionContext,
    });

    if (deletedCount === 0) {
      throw commonHelpers.customError('No user found', 404);
    }
    await transactionContext.commit();
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting user', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const get = async (currentUser, userId) => {
  if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
    throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
  }
  const userDetails = await models.User.findOne({
    where: { id: userId },
    include: { model: models.Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } },
  });

  if (!userDetails) {
    throw commonHelpers.customError('User not found', 404);
  }
  return userDetails;
};

const getAll = async queryOptions => {
  const { page = 1, limit = 10, role } = queryOptions;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  let filter = {};
  const userRole = role?.toLowerCase();
  if (userRole === 'admin') {
    filter.name = constants.ROLES.ADMIN;
  } else if (userRole === 'delivery-partner') {
    filter.name = constants.ROLES.DELIVERY_PARTNER;
  } else if (userRole === 'customer') {
    filter.name = constants.ROLES.CUSTOMER;
  }

  const users = await models.User.findAll({
    include: {
      model: models.Role,
      as: 'roles',
      attributes: ['id', 'name'],
      where: filter,
      through: { attributes: [] },
    },
    offset: startIndex,
    limit: endIndex,
  });
  if (!users || users.length === 0) {
    throw commonHelpers.customError('No users found', 404);
  }
  return users;
};

module.exports = { create, assignRole, addAddress, removeAccount, get, getAll };

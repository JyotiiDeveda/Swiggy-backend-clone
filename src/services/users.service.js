const commonHelpers = require('../helpers/common.helper');
const constants = require('../constants/constants');
const { Op } = require('sequelize');
const { User, Role, UserRole } = require('../models');
const { sequelize } = require('../models');

const create = async data => {
  const transactionContext = await sequelize.transaction();
  try {
    const { firstName, lastName, email, phone, address, role = constants.ROLES.CUSTOMER } = data;
    const userExists = await User.findOne({
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
      const [restoredUser] = await User.restore({
        where: { email, phone },
        returning: true,
        transaction: transactionContext,
      });
      if (!restoredUser) throw commonHelpers.customError('Credentials should be unique', 409);
      await transactionContext.commit();
      return restoredUser;
    }

    // Creating a user
    const newUser = await User.create({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      address,
    });

    const roleDetails = await Role.findOne({ where: { name: role } });

    // assign role to user
    const userRole = await UserRole.findOrCreate({
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
    const roleDetails = await Role.findOne({ where: { id: roleId } });

    if (!roleDetails) {
      throw commonHelpers.customError('Role does not exist', 404);
    }

    const usersRole = {
      user_id: userId,
      role_id: roleDetails.id,
    };

    const userRole = await UserRole.findOrCreate({
      where: usersRole,
      transaction: transactionContext,
    });
    if (!userRole) {
      commonHelpers.customError('Failed to assign role', 400);
    }
    console.log('Assigned role successfully');
    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error while adding delivery partner', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const updateProfile = async (currentUser, userId, payload) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const userDetails = await User.findByPk(userId);
    if (!userDetails) {
      throw commonHelpers.customError('User not found', 404);
    }

    const userToUpdate = {
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    };

    await userDetails.update(userToUpdate, { transaction: transactionContext });

    await transactionContext.commit();
    return userDetails;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in updating profile', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const removeAccount = async (currentUser, userId) => {
  const transactionContext = await sequelize.transaction();
  try {
    if (!currentUser?.userRoles.includes(constants.ROLES.ADMIN) && currentUser.userId !== userId) {
      throw commonHelpers.customError('Given user is not authorized for this endpoint', 403);
    }

    const user = await User.findByPk(userId);

    if (!user) {
      throw commonHelpers.customError('No user found', 404);
    }

    await User.destroy({
      where: { id: userId },
      transaction: transactionContext,
    });

    await transactionContext.commit();
    return;
  } catch (err) {
    await transactionContext.rollback();
    console.log('Error in deleting user', err.message);
    throw commonHelpers.customError(err.message, err.statusCode);
  }
};

const get = async userId => {
  const userDetails = await User.findOne({
    where: { id: userId },
    include: { model: Role, as: 'roles', attributes: ['id', 'name'], through: { attributes: [] } },
  });

  if (!userDetails) {
    throw commonHelpers.customError('User not found', 404);
  }
  return userDetails;
};

const getAll = async queryOptions => {
  const { page = 1, limit = 10, role } = queryOptions;
  const startIndex = (page - 1) * limit;

  let filter = {};
  const userRole = role?.toLowerCase();
  if (userRole === 'admin') {
    filter.name = constants.ROLES.ADMIN;
  } else if (userRole === 'delivery-partner') {
    filter.name = constants.ROLES.DELIVERY_PARTNER;
  } else if (userRole === 'customer') {
    filter.name = constants.ROLES.CUSTOMER;
  }

  const users = await User.findAndCountAll({
    distinct: true,
    include: {
      model: Role,
      as: 'roles',
      attributes: ['id', 'name'],
      where: filter,
      through: { attributes: [] },
    },
    offset: startIndex,
    limit: limit,
  });

  console.log(users);
  if (!users || users?.count === 0) {
    throw commonHelpers.customError('No users found', 404);
  }

  const response = {
    rows: users.rows,
    pagination: {
      totalRecords: users.count,
      currentPage: parseInt(page),
      recordsPerPage: parseInt(limit),
      noOfPages: Math.ceil(users.count / limit),
    },
  };

  return response;
};

module.exports = { create, assignRole, updateProfile, removeAccount, get, getAll };

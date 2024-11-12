const commonHelpers = require('../helpers/common.helper');
const { Op } = require('sequelize');
const models = require('../models');

const create = async data => {
  const { first_name, last_name, email, phone, address } = data;
  const userExists = await models.User.findOne(
    { where: { [Op.or]: [{ email }, { phone }] } },
    { paranoid: false }
  );
  console.log('Existing uer: ', userExists);

  // if user exists actively
  if (userExists && userExists.deleted_at === null) {
    throw commonHelpers.customError('User already exists (email and phone number should be unique)', 409);
  }

  // if soft deleted, activate the user
  else if (userExists?.deleted_at) {
    models.user.restore({ where: { email } });
    return userExists;
  }

  // Creating a user
  const newUser = models.User.build({
    first_name,
    last_name,
    email,
    phone,
  });

  newUser.address = address ? address : '';
  await newUser.save();

  // a user can signup with customer role only
  const roleDetails = await models.Role.findOne({ where: { name: 'Customer' } });

  await assignRole(newUser.id, roleDetails.id);

  return newUser;
};

const assignRole = async (user_id, roleId) => {
  // a user can signup with customer role only
  const roleDetails = await models.Role.findOne({ where: { id: roleId } });

  if (!roleDetails) {
    throw commonHelpers.customError('Role does not exist', 404);
  }

  const usersRole = {
    user_id,
    role_id: roleDetails.id,
  };

  await models.UserRole.create(usersRole);
  console.log('Assigned role successfully');
};

const addAddress = async (userId, address) => {
  if (!address) {
    throw commonHelpers.customError('No address provided', 422);
  }

  await models.User.update({ address: address }, { where: { id: userId } });
  console.log('Address updated	');
};

const removeAccount = async userId => {
  await models.User.destroy({ where: { id: userId } });
  console.log('Deleted user');
};

const get = async userId => {
  const userDetails = await models.User.findOne({ where: { id: userId } });

  if (!userDetails) {
    throw commonHelpers.customError('User not found', 404);
  }
  return userDetails;
};

const getAll = async (page, limit) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const users = await models.User.findAll({ offset: startIndex, limit: endIndex });
  if (!users || users.length === 0) {
    throw commonHelpers.customError('No users found', 404);
  }
  return users;
};

module.exports = { create, assignRole, addAddress, removeAccount, get, getAll };

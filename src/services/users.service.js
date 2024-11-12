const commonHelpers = require('../helpers/common.helper');

const models = require('../models');

const create = async data => {
  const { first_name, last_name, email, phone, address } = data;
  const userExists = await models.User.findOne({ where: { email } }, { paranoid: false });
  console.log('Existing user: ', userExists);

  // if user exists actively
  if (userExists && userExists.deleted_at === null) {
    throw commonHelpers.customError('User already exists', 409);
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
  await assignRole(newUser.id, 'Customer');

  return newUser;
};

const assignRole = async (user_id, role) => {
  // a user can signup with customer role only
  const roleDetails = await models.Role.findOne({ where: { name: role } });

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

module.exports = { create, assignRole };

const serializeUser = (req, res, next) => {
  let { rows } = res.data;
  let users = [];

  if (!rows) {
    rows = Array.isArray(res.data) ? res.data : [res.data];
  }
  console.log('RESPONSE DATA: ', res.data);
  for (const user of rows) {
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      createdAt: user.created_at,
      deletedAt: user.deleted_at,
      updatedAt: user.updated_at,
    };

    const userRoles = user?.roles;
    const roles = [];
    for (const role of userRoles) {
      roles.push(role.name);
    }

    console.log('ROLES: ', user.roles);
    userData.roles = roles;
    users.push(userData);
  }

  res.data = { users };
  next();
};

module.exports = {
  serializeUser,
};

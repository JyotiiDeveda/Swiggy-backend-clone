const serializeUsers = (req, res, next) => {
  let rows = res.data?.rows || res.data;
  let users = [];

  const isSingleItem = !Array.isArray(rows);

  if (!Array.isArray(rows)) {
    rows = [rows];
  }

  users = rows.map(user => {
    const userData = {
      id: user?.id,
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
      phone: user?.phone,
      address: user?.address,
      createdAt: user?.created_at,
      deletedAt: user?.deleted_at,
      updatedAt: user?.updated_at,
    };

    if (user?.roles) {
      userData.roles = user.roles.map(role => role.name);
    }

    return userData;
  });

  res.data = isSingleItem ? { user: users[0] } : { users };

  next();
};

module.exports = {
  serializeUsers,
};

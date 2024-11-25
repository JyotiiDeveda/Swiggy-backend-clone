const serializeRoles = (req, res, next) => {
  let rows = res.data?.rows || res.data;

  const isSingleItem = !Array.isArray(rows);

  if (isSingleItem) {
    rows = [rows];
  }

  const roles = rows.map(role => {
    const roleData = {
      id: role?.id,
      name: role?.name,
    };
    return roleData;
  });

  res.data = isSingleItem ? { role: roles[0] } : { roles };

  next();
};

module.exports = {
  serializeRoles,
};

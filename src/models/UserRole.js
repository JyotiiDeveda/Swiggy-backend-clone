'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      UserRole.belongsToMany(models.User);
      UserRole.belongsToMany(models.Role);
    }
  }
  UserRole.init(
    {
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      role_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Role',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'UserRole',
      tableName: 'users_roles',
      paranoid: true,
    }
  );
  return UserRole;
};

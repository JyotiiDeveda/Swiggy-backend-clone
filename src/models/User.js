'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, {
        through: 'UserRole',
        foreignKey: 'user_id',
        as: 'roles',
      });

      User.hasMany(models.Cart, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'carts',
      });

      User.hasMany(models.Order, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'orders',
      });
    }
  }
  User.init(
    {
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      phone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      paranoid: true,
    }
  );
  return User;
};

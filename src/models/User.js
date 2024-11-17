'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Role, {
        through: 'UserRole',
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'roles',
      });

      User.hasMany(models.Cart, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'carts',
      });

      User.hasMany(models.Order, {
        foreignKey: 'delivery_partner_id',
        onDelete: 'CASCADE',
        as: 'orders',
      });

      User.hasMany(models.Payment, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'payments',
      });

      User.hasMany(models.Rating, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
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
        type: DataTypes.JSONB,
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

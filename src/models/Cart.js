'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'user',
      });

      Cart.belongsToMany(models.Dish, {
        through: 'CartDishes',
        foreignKey: 'cart_id',
        as: 'dishes',
      });

      Cart.hasOne(models.Order, {
        foreignKey: 'cart_id',
      });
    }
  }
  Cart.init(
    {
      user_id: {
        type: DataTypes.UUID,
        references: {
          model: 'User',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM,
        values: ['active', 'locked'],
        defaultValue: 'active',
      },
    },
    {
      sequelize,
      modelName: 'Cart',
      tableName: 'carts',
      timestamps: true,
      paranoid: true,
    }
  );
  return Cart;
};

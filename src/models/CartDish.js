'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartDish extends Model {
    static associate() {}
  }
  CartDish.init(
    {
      cart_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Cart',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      dish_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Dish',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'CartDish',
      tableName: 'cart_dishes',
      timestamps: true,
      paranoid: true,
    }
  );
  return CartDish;
};

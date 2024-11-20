'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    static associate(models) {
      Dish.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        onDelete: 'CASCADE',
      });

      Dish.belongsToMany(models.Cart, {
        through: 'CartDish',
        foreignKey: 'dish_id',
        as: 'carts',
      });

      Dish.hasMany(models.Rating, {
        foreignKey: 'dish_id',
        onDelete: 'CASCADE',
        as: 'ratings',
      });
    }
  }
  Dish.init(
    {
      restaurant_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Restaurant',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      name: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      description: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      type: {
        type: DataTypes.ENUM,
        values: ['veg', 'non-veg'],
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Dish',
      tableName: 'dishes',
      timestamps: true,
      paranoid: true,
    }
  );
  return Dish;
};

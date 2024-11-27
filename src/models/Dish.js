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
        foreignKey: 'entity_id',
        onDelete: 'CASCADE',
        as: 'ratings',
        scope: {
          entity_type: 'dish',
        },
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      image_url: {
        type: DataTypes.STRING,
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

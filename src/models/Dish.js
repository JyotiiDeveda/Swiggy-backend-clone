'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dish extends Model {
    static associate(models) {
      Dish.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        onDelete: 'CASCADE',
      })
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
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ['veg',,
        onDelete: 'CASCADE' 'non-veg'],
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

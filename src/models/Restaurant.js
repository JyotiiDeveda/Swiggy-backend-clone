'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      Restaurant.hasMany(models.Dish, {
        foreignKey: 'restaurant_id',
        onDelete: 'CASCADE',
        as: 'dishes',
      });
    }
  }
  Restaurant.init(
    {
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
        allowNull: false,
      },
      category: {
        type: DataTypes.ENUM,
        values: ['veg', 'non-veg', 'both'],
        defaultValue: 'veg',
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Restaurant',
      tableName: 'restaurants',
      timestamps: true,
      paranoid: true,
    }
  );
  return Restaurant;
};

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

      Restaurant.hasMany(models.Rating, {
        foreignKey: 'entity_id',
        onDelete: 'CASCADE',
        as: 'ratings',
        scope: {
          entity_type: 'restaurant',
        },
      });

      Restaurant.hasMany(models.Order, {
        foreignKey: 'restaurant_id',
        onDelete: 'SET NULL',
        as: 'orders',
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
        allowNull: true,
      },
      category: {
        type: DataTypes.ENUM,
        values: ['veg', 'non-veg', 'both'],
        defaultValue: 'veg',
      },
      address: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      city_id: {
        type: DataTypes.UUID,
        references: {
          model: 'city',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
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

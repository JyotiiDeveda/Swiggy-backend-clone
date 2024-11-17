'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rating extends Model {
    static associate(models) {
      Rating.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });

      Rating.belongsTo(models.Restaurant, {
        foreignKey: 'restaurant_id',
        onDelete: 'CASCADE',
      });

      Rating.belongsTo(models.Dish, {
        foreignKey: 'dish_id',
        onDelete: 'CASCADE',
      });
    }
  }
  Rating.init(
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
      entity_type: {
        type: DataTypes.ENUM,
        values: ['restaurant', 'dish'],
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.UUID,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      dish_id: {
        type: DataTypes.INTEGER,
        references: {
          model: 'DISHES',
          key: 'id',
        },
        allowNull: true,
        onDelete: 'CASCADE',
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Rating',
      tableName: 'ratings',
      timestamps: true,
      paranoid: true,
    }
  );
  return Rating;
};

'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });

      Order.hasOne(models.Payment, {
        foreignKey: 'order_id',
      });
    }
  }
  Order.init(
    {
      cart_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Cart',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'SET NULL',
      },
      restaurant_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Restaurant',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'SET NULL',
      },
      delivery_partner_id: {
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
        values: ['preparing', 'delivered', 'cancelled'],
        defaultValue: 'preparing',
      },
      delivery_charges: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      gst: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      order_charges: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
      timestamps: true,
      paranoid: true,
    }
  );
  return Order;
};

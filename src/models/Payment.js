'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Order, {
        foreignKey: 'order_id',
        onDelete: 'CASCADE',
      });

      Payment.belongsTo(models.User, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
      });
    }
  }
  Payment.init(
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
      order_id: {
        type: DataTypes.UUID,
        references: {
          model: 'Order',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      total_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM,
        values: ['online', 'cash-on-delivery'],
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ['pending', 'successfull', 'failed'],
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: 'Payment',
      tableName: 'payments',
      timestamps: true,
      paranoid: true,
    }
  );
  return Payment;
};

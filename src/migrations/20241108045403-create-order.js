'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      cart_id: {
        type: Sequelize.UUID,
        references: {
          model: 'carts',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'SET NULL',
      },
      restaurant_id: {
        type: Sequelize.UUID,
        references: {
          model: 'restaurants',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'SET NULL',
      },
      delivery_partner_id: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM,
        values: ['preparing', 'delivered', 'cancelled'],
        defaultValue: 'preparing',
        allowNull: false,
      },
      delivery_charges: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      gst: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      order_charges: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      total_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('orders');
  },
};

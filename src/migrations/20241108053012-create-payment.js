'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
        primaryKey: true,
      },
      order_id: {
        type: Sequelize.UUID,
        references: {
          model: 'orders',
          key: 'id',
        },
        allowNull: false,
        onDelete: 'CASCADE',
      },
      total_amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM,
        values: ['online', 'cash-on-delivery'],
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['pending', 'successfull', 'failed'],
        defaultValue: 'pending',
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
    await queryInterface.dropTable('payments');
  },
};

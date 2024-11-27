'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('restaurants', 'city_id', {
      type: Sequelize.UUID,
      references: {
        model: 'cities',
        key: 'id',
      },
      allowNull: false,
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('restaurants', 'city_id');
  },
};

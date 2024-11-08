'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [roles] = await queryInterface.bulkInsert(
      'roles',
      [{ name: 'Admin' }, { name: 'Customer' }, { name: 'Delivery Partner' }],
      { returning: ['id'] }
    );

    // console.log('Roles: ', roles);
    const [users] = await queryInterface.bulkInsert(
      'users',
      [
        {
          first_name: 'Jyoti',
          last_name: 'Deveda',
          email: 'jyoti@gkmit.co',
          phone: '3456789023',
          address: 'Udaipur, Rajasthan',
        },
      ],
      { returning: ['id', 'email'] }
    );
    // console.log('Users: ', users);

    await queryInterface.bulkInsert('users_roles', [
      {
        user_id: users.id,
        role_id: roles.id,
      },
    ]);
  },

  async down() {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};

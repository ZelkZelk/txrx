'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _Sequelize) {
    const bcrypt = await import('bcrypt');
    const password = await bcrypt.hash('Abcd1234', 15);

    return queryInterface.bulkInsert({
      tableName: 'roles',
      schema: 'auth'
    }, [{
        role: 'ADMIN'
    } , {
        role: 'READ_ONLY'
    }]).then(() => {
      return queryInterface.bulkInsert({
        tableName: 'users',
        schema: 'auth'
      }, [{
        email: 'felipeklez@gmail.com',
        handle: 'klez',
        password,
      }]).then(() => {
        return queryInterface.sequelize.query('INSERT INTO auth.user_roles (user_id, role_id) SELECT u.id, r.id FROM auth.users u INNER JOIN auth.roles r ON r.role = ? WHERE u.handle = ?', {
          replacements: ['ADMIN', 'klez']
        });
      });
    })
  },

  async down (queryInterface, _Sequelize) {
    return queryInterface.bulkDelete({
      tableName: 'user_roles',
      schema: 'auth'
    }).then(() => {
      return queryInterface.bulkDelete({
        tableName: 'roles',
        schema: 'auth'
      }).then(() => {
        return queryInterface.bulkDelete({
          tableName: 'users',
          schema: 'auth'
        });
      });
    })
  }
};

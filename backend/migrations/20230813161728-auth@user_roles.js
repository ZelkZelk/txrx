'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _Sequelize) {
    return queryInterface.createTable('user_roles', {
      id: { type: 'BIGSERIAL', primaryKey: true },
      role_id: { 
        type: DataTypes.BIGINT, 
        allowNull: false, 
        references: {
          model: {
            tableName: 'roles',
            schema: 'auth'
          },
          key: 'id'
        },
      },
      user_id: { 
        type: DataTypes.BIGINT, 
        allowNull: false, 
        references: {
          model: {
            tableName: 'users',
            schema: 'auth'
          },
          key: 'id'
        },
      },
    }, {
      schema: 'auth'
    }).then(() => {
      return queryInterface.addIndex({
        tableName: 'user_roles',
        schema: 'auth'
      }, ['user_id', 'role_id'], {
        name: 'auth_user_roles_UNIQ',
        unique: true,
      });
    });
  },

  async down (queryInterface, _Sequelize) {
    return queryInterface.removeIndex({
      tableName: 'user_roles',
      schema: 'auth'
    }, 'auth_user_roles_UNIQ').then(() => {
      return queryInterface.dropTable({
        tableName: 'user_roles',
        schema: 'auth'
      });
    })
  }
};

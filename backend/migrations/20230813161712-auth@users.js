'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.createTable('users', {
      id: { type: 'BIGSERIAL', primaryKey: true},
      handle: { type: DataTypes.STRING, allowNull: false, unique: true }, 
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      created: { type: 'TIMESTAMP', allowNull: false, defaultValue: Sequelize.fn('now') },
      last_login: { type: 'TIMESTAMP' },
      deleted: { type: 'TIMESTAMP' },
    }, {
      schema: 'auth'
    });
  },

  async down (queryInterface, _Sequelize) {
    return queryInterface.dropTable({
      tableName: 'users',
      schema: 'auth'
    });
  }
};

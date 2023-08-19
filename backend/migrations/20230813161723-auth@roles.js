'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _Sequelize) {
    return queryInterface.createTable('roles', {
      id: { type: 'BIGSERIAL', primaryKey: true },
      role: { type: DataTypes.STRING, allowNull: false, unique: true },
      deleted: { type: 'TIMESTAMP', allowNull: true },
    }, {
      schema: 'auth'
    });
  },

  async down (queryInterface, _Sequelize) {
    return queryInterface.dropTable({
      tableName: 'roles',
      schema: 'auth'
    });
  }
};

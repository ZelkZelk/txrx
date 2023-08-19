'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, _Sequelize) {
    return queryInterface.createSchema('auth');
  },

  async down (queryInterface, _Sequelize) {
    return queryInterface.dropSchema('auth');
  }
};

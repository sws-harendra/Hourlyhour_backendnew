'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Services', 'warranty', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'duration'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Services', 'warranty');
  }
};
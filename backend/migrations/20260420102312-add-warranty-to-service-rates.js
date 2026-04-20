'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Service_rates', 'warranty', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'price'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Service_rates', 'warranty');
  }
};
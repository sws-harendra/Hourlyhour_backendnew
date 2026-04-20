'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('service_rates', 'warranty', {
      type: Sequelize.STRING(100),
      allowNull: true,
      after: 'price'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('service_rates', 'warranty');
  }
};
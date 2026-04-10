'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Bookings', 'warrantyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'warranties',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('Bookings', 'warrantyExpiryDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Bookings', 'completedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Bookings', 'warrantyId');
    await queryInterface.removeColumn('Bookings', 'warrantyExpiryDate');
    await queryInterface.removeColumn('Bookings', 'completedAt');
  }
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "taxPercentageAtBooking", {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0, // 👈 important to avoid errors on old data
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "taxPercentageAtBooking");
  },
};

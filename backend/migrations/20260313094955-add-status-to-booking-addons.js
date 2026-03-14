"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("BookingAddons", "status", {
      type: Sequelize.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
      after: "quantity", // optional: places column after quantity
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("BookingAddons", "status");
  },
};

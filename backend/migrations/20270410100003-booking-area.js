"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "areaId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "ServiceAreas", // make sure table name matches exactly
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL", // safer for bookings history
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "areaId");
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tableInfo = await queryInterface.describeTable("Bookings");

    if (!tableInfo.paymentMethod) {
      await queryInterface.addColumn("Bookings", "paymentMethod", {
        type: Sequelize.ENUM("cash", "online", "pending"),
        allowNull: false,
        defaultValue: "pending",
      });
    }

    if (!tableInfo.paymentStatus) {
      await queryInterface.addColumn("Bookings", "paymentStatus", {
        type: Sequelize.ENUM("pending", "paid", "failed"),
        allowNull: false,
        defaultValue: "pending",
      });
    }

    if (!tableInfo.cashProofImage) {
      await queryInterface.addColumn("Bookings", "cashProofImage", {
        type: Sequelize.STRING(1000),
        allowNull: true,
        defaultValue: null,
      });
    }

    if (!tableInfo.paidAt) {
      await queryInterface.addColumn("Bookings", "paidAt", {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Bookings", "paidAt");
    await queryInterface.removeColumn("Bookings", "cashProofImage");
    await queryInterface.removeColumn("Bookings", "paymentStatus");
    await queryInterface.removeColumn("Bookings", "paymentMethod");
  },
};

"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("app_settings", "paymentQrCode", {
      type: Sequelize.STRING(1000),
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.addColumn("app_settings", "paymentUpiId", {
      type: Sequelize.STRING(255),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("app_settings", "paymentQrCode");
    await queryInterface.removeColumn("app_settings", "paymentUpiId");
  },
};

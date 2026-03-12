"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("app_settings", "assignType", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "auto",
      validate: {
        isIn: [["manual", "auto"]],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("app_settings", "assignType");
  },
};

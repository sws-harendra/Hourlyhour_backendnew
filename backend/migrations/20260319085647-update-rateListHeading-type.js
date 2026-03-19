"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Services", "rateListHeading", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Services", "rateListHeading", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

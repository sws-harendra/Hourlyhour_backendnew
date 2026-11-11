"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable("Categories").catch(() => null);
      if (tableInfo && !tableInfo.icon) {
        await queryInterface.addColumn("Categories", "icon", {
          type: Sequelize.STRING,
          allowNull: true,
        });
      }
    } catch (err) {
      console.log("Migration notice (icon):", err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable("Categories").catch(() => null);
      if (tableInfo && tableInfo.icon) {
        await queryInterface.removeColumn("Categories", "icon");
      }
    } catch (err) {
      console.log("Migration rollback notice (icon):", err.message);
    }
  },
};

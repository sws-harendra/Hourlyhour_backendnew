"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable("blogs").catch(() => null);
      if (tableInfo && !tableInfo.imageLink) {
        await queryInterface.addColumn("blogs", "imageLink", {
          type: Sequelize.TEXT,
          allowNull: true,
        });
      }
    } catch (err) {
      console.log("Migration warning (imageLink):", err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable("blogs").catch(() => null);
      if (tableInfo && tableInfo.imageLink) {
        await queryInterface.removeColumn("blogs", "imageLink");
      }
    } catch (err) {
      console.log("Migration rollback warning (imageLink):", err.message);
    }
  },
};


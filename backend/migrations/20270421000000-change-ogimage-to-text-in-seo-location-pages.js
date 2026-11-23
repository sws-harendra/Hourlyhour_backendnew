"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface
        .describeTable("seo_location_pages")
        .catch(() => null);
      if (tableInfo) {
        if (tableInfo.ogImage) {
          await queryInterface.changeColumn("seo_location_pages", "ogImage", {
            type: Sequelize.TEXT,
            allowNull: true,
          });
        }
        if (tableInfo.canonicalUrl) {
          await queryInterface.changeColumn("seo_location_pages", "canonicalUrl", {
            type: Sequelize.TEXT,
            allowNull: true,
          });
        }
      }
    } catch (err) {
      console.log("Migration warning (ogImage/canonicalUrl):", err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface
        .describeTable("seo_location_pages")
        .catch(() => null);
      if (tableInfo && tableInfo.ogImage) {
        await queryInterface.changeColumn("seo_location_pages", "ogImage", {
          type: Sequelize.STRING(500),
          allowNull: true,
        });
      }
    } catch (err) {
      console.log("Migration rollback warning (ogImage):", err.message);
    }
  },
};

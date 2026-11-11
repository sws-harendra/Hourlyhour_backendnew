"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ensure index on serviceId in service_rates table
    try {
      const [indexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM `service_rates` WHERE Column_name = 'serviceId'"
      );
      if (!indexes || indexes.length === 0) {
        await queryInterface.sequelize.query(
          "ALTER TABLE `service_rates` ADD INDEX `service_rates_serviceId_idx` (`serviceId`)"
        );
        console.log("Migration: Added index on service_rates.serviceId");
      }
    } catch (err) {
      console.log("Migration notice (service_rates index):", err.message);
    }

    // 2. Ensure index on Services.rateListHeading for fast Rate Card filtering
    try {
      const [indexes] = await queryInterface.sequelize.query(
        "SHOW INDEX FROM `Services` WHERE Column_name = 'rateListHeading'"
      );
      if (!indexes || indexes.length === 0) {
        await queryInterface.sequelize.query(
          "ALTER TABLE `Services` ADD INDEX `services_rateListHeading_idx` (`rateListHeading`(191))"
        );
        console.log("Migration: Added index on Services.rateListHeading");
      }
    } catch (err) {
      console.log("Migration notice (services rateListHeading index):", err.message);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE `service_rates` DROP INDEX `service_rates_serviceId_idx`"
      );
    } catch (_) {}

    try {
      await queryInterface.sequelize.query(
        "ALTER TABLE `Services` DROP INDEX `services_rateListHeading_idx`"
      );
    } catch (_) {}
  },
};

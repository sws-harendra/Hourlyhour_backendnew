"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Auto-ensure 'icon' column exists in Categories table (safe non-destructive sync)
(async () => {
  try {
    const [cols] = await sequelize.query("SHOW COLUMNS FROM `Categories` LIKE 'icon'");
    if (!cols || cols.length === 0) {
      await sequelize.query("ALTER TABLE `Categories` ADD COLUMN `icon` VARCHAR(255) NULL AFTER `image`");
      console.log("Auto-migrated: Added 'icon' column to Categories table.");
    }
  } catch (_) {
    // Ignore if DB connection not ready yet or table doesn't exist
  }
})();

// Auto-ensure 'imageLink' column exists in blogs table (safe non-destructive sync)
(async () => {
  try {
    const [cols] = await sequelize.query("SHOW COLUMNS FROM `blogs` LIKE 'imageLink'");
    if (!cols || cols.length === 0) {
      await sequelize.query("ALTER TABLE `blogs` ADD COLUMN `imageLink` TEXT NULL AFTER `image`");
      console.log("Auto-migrated: Added 'imageLink' column to blogs table.");
    }
  } catch (_) {
    // Ignore if DB connection not ready yet or table doesn't exist
  }
})();

// Auto-ensure index on service_rates.serviceId for Rate Card associations
(async () => {
  try {
    const [indexes] = await sequelize.query(
      "SHOW INDEX FROM `service_rates` WHERE Column_name = 'serviceId'"
    );
    if (!indexes || indexes.length === 0) {
      await sequelize.query(
        "ALTER TABLE `service_rates` ADD INDEX `service_rates_serviceId_idx` (`serviceId`)"
      );
      console.log("Auto-migrated: Added index on service_rates.serviceId.");
    }
  } catch (_) {
    // Ignore if DB connection not ready yet or table doesn't exist
  }
})();

// Auto-sync seo_location_pages table
(async () => {
  try {
    if (db.SeoLocationPage) {
      await db.SeoLocationPage.sync({ alter: false });
      console.log("Auto-migrated: Ensured 'seo_location_pages' table exists.");
    }
  } catch (err) {
    console.error("Error auto-syncing seo_location_pages table:", err.message);
  }
})();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

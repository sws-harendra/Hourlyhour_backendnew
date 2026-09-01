"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add customerName to Bookings
    const bookingsTable = await queryInterface.describeTable("Bookings");

    if (!bookingsTable.customerName) {
      await queryInterface.addColumn("Bookings", "customerName", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!bookingsTable.customerPhone) {
      await queryInterface.addColumn("Bookings", "customerPhone", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!bookingsTable.customerEmail) {
      await queryInterface.addColumn("Bookings", "customerEmail", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!bookingsTable.discount) {
      await queryInterface.addColumn("Bookings", "discount", {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      });
    }

    // 2. Modify rateId on BookingAddons to be nullable for custom items
    const bookingAddonsTable = await queryInterface.describeTable("BookingAddons");
    if (bookingAddonsTable.rateId) {
      await queryInterface.changeColumn("BookingAddons", "rateId", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const bookingsTable = await queryInterface.describeTable("Bookings");

    if (bookingsTable.customerName) {
      await queryInterface.removeColumn("Bookings", "customerName");
    }
    if (bookingsTable.customerPhone) {
      await queryInterface.removeColumn("Bookings", "customerPhone");
    }
    if (bookingsTable.customerEmail) {
      await queryInterface.removeColumn("Bookings", "customerEmail");
    }
    if (bookingsTable.discount) {
      await queryInterface.removeColumn("Bookings", "discount");
    }

    const bookingAddonsTable = await queryInterface.describeTable("BookingAddons");
    if (bookingAddonsTable.rateId) {
      await queryInterface.changeColumn("BookingAddons", "rateId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      });
    }
  },
};

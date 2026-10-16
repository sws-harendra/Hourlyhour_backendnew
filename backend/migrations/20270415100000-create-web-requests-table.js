"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if table already exists before creating
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("web_requests")) {
      await queryInterface.createTable("web_requests", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        inquiryId: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        customerName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        email: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        serviceName: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        category: {
          type: Sequelize.STRING,
          defaultValue: "Home Appliance",
        },
        city: {
          type: Sequelize.STRING,
          defaultValue: "Patna",
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        appliances: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        source: {
          type: Sequelize.STRING,
          defaultValue: "Website Booking Form",
        },
        status: {
          type: Sequelize.ENUM("pending", "contacted", "in_progress", "completed", "cancelled"),
          defaultValue: "pending",
        },
        preferredDate: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        preferredTime: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("web_requests");
  },
};

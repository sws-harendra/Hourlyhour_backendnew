"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ServiceAreaPrices", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      serviceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Services", // make sure table name matches
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      areaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ServiceAreas", // your polygon table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // ✅ Composite unique constraint (VERY IMPORTANT)
    await queryInterface.addConstraint("ServiceAreaPrices", {
      fields: ["serviceId", "areaId"],
      type: "unique",
      name: "unique_service_area_price",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ServiceAreaPrices");
  },
};

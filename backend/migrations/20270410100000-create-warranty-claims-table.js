"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("warranty_claims", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      bookingId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Bookings",
          key: "id",
        },
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },

      warrantyId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "warranties",
          key: "id",
        },
      },

      claimDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      claimImage: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected", "resolved"),
        defaultValue: "pending",
      },

      adminNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      claimedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      resolvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("warranty_claims");
  },
};

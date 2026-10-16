"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("blogs")) {
      await queryInterface.createTable("blogs", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        author: {
          type: Sequelize.STRING(100),
          defaultValue: "Repair Saathi Team",
        },
        category: {
          type: Sequelize.STRING(100),
          defaultValue: "Appliance Repair",
        },
        tags: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        readTime: {
          type: Sequelize.STRING(50),
          defaultValue: "4 min read",
        },
        image: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        excerpt: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT("long"),
          allowNull: false,
        },
        metaTitle: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        metaDescription: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        metaKeywords: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM("published", "draft"),
          defaultValue: "published",
        },
        isFeatured: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        views: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        publishedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW,
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
    await queryInterface.dropTable("blogs");
  },
};

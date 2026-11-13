"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes("seo_location_pages")) {
      await queryInterface.createTable("seo_location_pages", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        serviceId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Services",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        serviceName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        locationId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "ServiceAreas",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
        },
        locationName: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true,
        },
        template: {
          type: Sequelize.ENUM("grid", "timeline", "card", "split"),
          defaultValue: "grid",
        },
        focusKeyword: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM("draft", "published"),
          defaultValue: "draft",
        },
        h1Heading: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        heroDescription: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        contentSections: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
        },
        faqs: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: [],
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
          type: Sequelize.TEXT,
          allowNull: true,
        },
        canonicalUrl: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        ogImage: {
          type: Sequelize.STRING(500),
          allowNull: true,
        },
        seoScore: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        },
        isAiGenerated: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        isHumanized: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        views: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
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

      // Indexes for fast lookups
      await queryInterface.addIndex("seo_location_pages", ["slug"], {
        name: "seo_location_pages_slug_idx",
        unique: true,
      });
      await queryInterface.addIndex("seo_location_pages", ["serviceId"], {
        name: "seo_location_pages_serviceId_idx",
      });
      await queryInterface.addIndex("seo_location_pages", ["locationId"], {
        name: "seo_location_pages_locationId_idx",
      });
      await queryInterface.addIndex("seo_location_pages", ["status"], {
        name: "seo_location_pages_status_idx",
      });
      await queryInterface.addIndex("seo_location_pages", ["seoScore"], {
        name: "seo_location_pages_seoScore_idx",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("seo_location_pages");
  },
};


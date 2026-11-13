module.exports = (sequelize, DataTypes) => {
  const SeoLocationPage = sequelize.define(
    "SeoLocationPage",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      serviceName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      locationName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      template: {
        type: DataTypes.ENUM("grid", "timeline", "card", "split"),
        defaultValue: "grid",
      },
      focusKeyword: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "published"),
        defaultValue: "draft",
      },
      h1Heading: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      heroDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      contentSections: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      faqs: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      metaTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metaKeywords: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      canonicalUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ogImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      seoScore: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isAiGenerated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isHumanized: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      tableName: "seo_location_pages",
      timestamps: true,
    }
  );

  SeoLocationPage.associate = (models) => {
    if (models.Service) {
      SeoLocationPage.belongsTo(models.Service, {
        foreignKey: "serviceId",
        as: "service",
      });
    }
    if (models.ServiceArea) {
      SeoLocationPage.belongsTo(models.ServiceArea, {
        foreignKey: "locationId",
        as: "serviceArea",
      });
    }
  };

  return SeoLocationPage;
};


// models/blog.model.js
module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "Blog",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      author: {
        type: DataTypes.STRING(100),
        defaultValue: "Repair Saathi Team",
      },
      category: {
        type: DataTypes.STRING(100),
        defaultValue: "Appliance Repair",
      },
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      readTime: {
        type: DataTypes.STRING(50),
        defaultValue: "4 min read",
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT("long"),
        allowNull: false,
      },
      metaTitle: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metaKeywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("published", "draft"),
        defaultValue: "published",
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      publishedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "blogs",
      timestamps: true,
    }
  );

  return Blog;
};

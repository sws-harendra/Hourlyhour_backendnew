// models/webrequest.model.js
module.exports = (sequelize, DataTypes) => {
  const WebRequest = sequelize.define(
    "WebRequest",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      inquiryId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      serviceName: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        defaultValue: "Home Appliance",
      },
      city: {
        type: DataTypes.STRING,
        defaultValue: "Patna",
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      appliances: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      source: {
        type: DataTypes.STRING,
        defaultValue: "Website Booking Form",
      },
      status: {
        type: DataTypes.ENUM("pending", "contacted", "in_progress", "completed", "cancelled"),
        defaultValue: "pending",
      },
      preferredDate: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      preferredTime: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "web_requests",
      timestamps: true,
    }
  );

  return WebRequest;
};

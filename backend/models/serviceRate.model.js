module.exports = (sequelize, DataTypes) => {
  const ServiceRate = sequelize.define(
    "ServiceRate",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "service_rates",
      timestamps: true,
    },
  );

  ServiceRate.associate = (models) => {
    ServiceRate.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });
  };

  return ServiceRate;
};

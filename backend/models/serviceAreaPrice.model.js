module.exports = (sequelize, DataTypes) => {
  const ServiceAreaPrice = sequelize.define("ServiceAreaPrice", {
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    areaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  });

  ServiceAreaPrice.associate = (models) => {
    ServiceAreaPrice.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });

    ServiceAreaPrice.belongsTo(models.ServiceArea, {
      foreignKey: "areaId",
      as: "area",
    });
  };

  return ServiceAreaPrice;
};

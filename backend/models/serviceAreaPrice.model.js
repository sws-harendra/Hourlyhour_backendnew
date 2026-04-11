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

  return ServiceAreaPrice;
};

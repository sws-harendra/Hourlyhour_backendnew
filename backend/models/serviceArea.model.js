module.exports = (sequelize, DataTypes) => {
  const ServiceArea = sequelize.define("ServiceArea", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // GeoJSON polygon with [lng, lat] coordinates
    polygon: {
      type: DataTypes.JSON,
      allowNull: false,
      // Example structure:
      // {
      //   "type": "Polygon",
      //   "coordinates": [[[lng1, lat1], [lng2, lat2], ..., [lng1, lat1]]]
      // }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return ServiceArea;
};

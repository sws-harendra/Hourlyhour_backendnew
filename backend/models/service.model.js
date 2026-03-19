module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define("Service", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shortDescription: {
      type: DataTypes.STRING,
    },

    fullDescription: {
      type: DataTypes.TEXT,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    rateType: {
      type: DataTypes.ENUM("fixed", "hourly", "per_service"),
      defaultValue: "fixed",
    },

    duration: {
      type: DataTypes.STRING, // e.g. "2 hours"
      allowNull: true,
    },

    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },

    isFeatured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },

    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isMostBooked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mainimage: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    rateListHeading: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  // models/Service.js
  Service.associate = (models) => {
    Service.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
    });

    Service.belongsToMany(models.User, {
      through: models.UserService,
      foreignKey: "serviceId",
      as: "providers",
    }); // 🔁 Related services (self join)
    Service.belongsToMany(models.Service, {
      through: models.ServiceRelation,
      as: "relatedServices",
      foreignKey: "serviceId",
      otherKey: "relatedServiceId",
    });
  };

  return Service;
};

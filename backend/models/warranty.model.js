module.exports = (sequelize, DataTypes) => {
  const Warranty = sequelize.define(
    "Warranty",
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

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      durationInDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "warranties",
      timestamps: true,
    },
  );

  Warranty.associate = (models) => {
    Warranty.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });
  };

  return Warranty;
};

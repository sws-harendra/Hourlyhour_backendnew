module.exports = (sequelize, DataTypes) => {
  const RequestedService = sequelize.define(
    "RequestedService",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
    },
    {
      tableName: "requested_services",
    }
  );
  // ✅ ADD THIS
  RequestedService.associate = (models) => {
    RequestedService.belongsTo(models.User, {
      foreignKey: "userId",
    });
  };

  return RequestedService;
};

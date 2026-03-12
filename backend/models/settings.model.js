module.exports = (sequelize, DataTypes) => {
  const AppSetting = sequelize.define(
    "AppSetting",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        defaultValue: 1, // single row only
      },

      adminCommissionPercent: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      minimumBalance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      assignType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "auto",
      },
    },
    {
      tableName: "app_settings",
      timestamps: true,
    },
  );

  return AppSetting;
};

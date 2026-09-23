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
      platformfee: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },

      tax: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      paymentQrCode: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        defaultValue: null,
      },
      paymentUpiId: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      tableName: "app_settings",
      timestamps: true,
    },
  );

  return AppSetting;
};

module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      discountValue: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },

      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "Coupons",
      timestamps: true,
    }
  );

  return Coupon;
};

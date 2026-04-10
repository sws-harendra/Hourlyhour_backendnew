module.exports = (sequelize, DataTypes) => {
  const WarrantyClaim = sequelize.define(
    "WarrantyClaim",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      bookingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      warrantyId: {
        type: DataTypes.INTEGER,
        allowNull: true, // 🔥 Allow null for bookings with only warrantyExpiryDate, no explicit warranty
      },

      claimDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      claimImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "resolved"),
        defaultValue: "pending",
      },

      adminNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      claimedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },

      resolvedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "warranty_claims",
      timestamps: true,
    },
  );

  WarrantyClaim.associate = (models) => {
    WarrantyClaim.belongsTo(models.Booking, {
      foreignKey: "bookingId",
      as: "booking",
    });

    WarrantyClaim.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });

    WarrantyClaim.belongsTo(models.Warranty, {
      foreignKey: "warrantyId",
      as: "warranty",
    });
  };

  return WarrantyClaim;
};

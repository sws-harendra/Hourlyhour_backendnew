module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    "Review",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bookingId: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "Reviews",
      timestamps: true,
    }
  );

  Review.associate = (models) => {
    Review.belongsTo(models.Booking, {
      foreignKey: "bookingId",
      as: "booking",
    });
    Review.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Review.belongsTo(models.User, {
      foreignKey: "providerId",
      as: "provider",
    });
  };

  return Review;
};

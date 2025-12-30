module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define("Booking", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    bookingTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    specialNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "on_the_way",
        "completed",
        "cancelled"
      ),
      defaultValue: "pending",
    },

    priceAtBooking: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    /** ✅ NEW FIELDS */
    completionOtp: {
      type: DataTypes.STRING(4),
      allowNull: true,
    },
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    Booking.belongsTo(models.User, {
      foreignKey: "providerId",
      as: "provider",
    });

    Booking.belongsTo(models.Service, {
      foreignKey: "serviceId",
      as: "service",
    });
  };

  return Booking;
};

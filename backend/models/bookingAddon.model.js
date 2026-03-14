module.exports = (sequelize, DataTypes) => {
  const BookingAddon = sequelize.define("BookingAddon", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rateId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
    },

    price: {
      type: DataTypes.FLOAT,
    },

    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      allowNull: false,
      defaultValue: "pending",
    },
  });

  BookingAddon.associate = (models) => {
    BookingAddon.belongsTo(models.Booking, {
      foreignKey: "bookingId",
      as: "booking",
    });

    BookingAddon.belongsTo(models.ServiceRate, {
      foreignKey: "rateId",
      as: "rate",
    });
  };

  return BookingAddon;
};

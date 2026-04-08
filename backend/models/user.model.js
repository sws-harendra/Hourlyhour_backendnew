module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      phone: {
        type: DataTypes.STRING,
        unique: true,

        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      wallet: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },

      userType: {
        type: DataTypes.ENUM("user", "service_provider"),
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "banned", "offline"),
        defaultValue: "active",
      },
      gender: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      bio: {
        type: DataTypes.STRING,
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
    },
    {
      tableName: "Users",
      timestamps: true,
    }
  );
  // models/User.js
  User.associate = (models) => {
    User.belongsToMany(models.Service, {
      through: models.UserService,
      foreignKey: "userId",
      as: "services",
    });
    User.hasMany(models.Address, {
      foreignKey: "userId",
      as: "addresses",
    });
    User.hasMany(models.Review, {
      foreignKey: "providerId",
      as: "providerReviews",
    });
    User.hasMany(models.Review, {
      foreignKey: "userId",
      as: "userReviews",
    });
  };

  return User;
};

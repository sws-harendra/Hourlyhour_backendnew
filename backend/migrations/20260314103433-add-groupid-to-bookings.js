module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Bookings", "groupId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Bookings", "groupId");
  },
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const [groupRows] = await queryInterface.sequelize.query(`
      SELECT groupId, MIN(id) AS firstBookingId
      FROM Bookings
      WHERE groupId IS NOT NULL
      GROUP BY groupId
      ORDER BY firstBookingId ASC
    `);

    await queryInterface.sequelize.transaction(async (transaction) => {
      for (let index = 0; index < groupRows.length; index += 1) {
        const row = groupRows[index];

        await queryInterface.bulkUpdate(
          "Bookings",
          { groupId: String(index + 1) },
          { groupId: row.groupId },
          { transaction },
        );
      }

      await queryInterface.changeColumn(
        "Bookings",
        "groupId",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("Bookings", "groupId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

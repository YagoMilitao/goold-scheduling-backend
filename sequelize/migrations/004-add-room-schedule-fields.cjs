"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("rooms", "startTime", {
      type: Sequelize.STRING(5),
      allowNull: false,
      defaultValue: "08:00"
    });

    await queryInterface.addColumn("rooms", "endTime", {
      type: Sequelize.STRING(5),
      allowNull: false,
      defaultValue: "18:00"
    });

    await queryInterface.addColumn("rooms", "slotMinutes", {
      type: Sequelize.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 30
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("rooms", "startTime");
    await queryInterface.removeColumn("rooms", "endTime");
    await queryInterface.removeColumn("rooms", "slotMinutes");
  }
};

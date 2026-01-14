"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      scheduledAt: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.ENUM("EM_ANALISE", "AGENDADO", "CANCELADO"), allowNull: false, defaultValue: "EM_ANALISE" },
      createdByRole: { type: Sequelize.ENUM("ADMIN", "CLIENT"), allowNull: false },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      roomId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: "rooms", key: "id" },
        onDelete: "RESTRICT",
        onUpdate: "CASCADE"
      },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bookings");
  }
};

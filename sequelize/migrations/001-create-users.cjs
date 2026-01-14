"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING(120), allowNull: false },
      email: { type: Sequelize.STRING(180), allowNull: false, unique: true },
      passwordHash: { type: Sequelize.STRING(255), allowNull: false },
      role: { type: Sequelize.ENUM("ADMIN", "CLIENT"), allowNull: false, defaultValue: "CLIENT" },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("users");
  }
};

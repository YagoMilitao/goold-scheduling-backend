"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "lastName", { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn("users", "cep", { type: Sequelize.STRING(9), allowNull: true });
    await queryInterface.addColumn("users", "address", { type: Sequelize.STRING(180), allowNull: true });
    await queryInterface.addColumn("users", "number", { type: Sequelize.STRING(20), allowNull: true });
    await queryInterface.addColumn("users", "complement", { type: Sequelize.STRING(80), allowNull: true });
    await queryInterface.addColumn("users", "neighborhood", { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn("users", "city", { type: Sequelize.STRING(120), allowNull: true });
    await queryInterface.addColumn("users", "state", { type: Sequelize.STRING(120), allowNull: true });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("users", "lastName");
    await queryInterface.removeColumn("users", "cep");
    await queryInterface.removeColumn("users", "address");
    await queryInterface.removeColumn("users", "number");
    await queryInterface.removeColumn("users", "complement");
    await queryInterface.removeColumn("users", "neighborhood");
    await queryInterface.removeColumn("users", "city");
    await queryInterface.removeColumn("users", "state");
  }
};

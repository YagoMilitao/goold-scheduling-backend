"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    const adminPass = await bcrypt.hash("Admin@123", 10);

    const [adminId] = await queryInterface.bulkInsert(
      "users",
      [
        { name: "Admin", email: "admin@portal.com", passwordHash: adminPass, role: "ADMIN", createdAt: now, updatedAt: now },
        { name: "Cliente 1", email: "cliente1@portal.com", passwordHash: adminPass, role: "CLIENT", createdAt: now, updatedAt: now }
      ],
      { returning: ["id"] }
    );

    await queryInterface.bulkInsert(
      "rooms",
      [
        { name: "Sala 01", createdAt: now, updatedAt: now },
        { name: "Sala 02", createdAt: now, updatedAt: now }
      ],
      {}
    );

    const users = await queryInterface.sequelize.query("SELECT id, role FROM users", { type: queryInterface.sequelize.QueryTypes.SELECT });
    const rooms = await queryInterface.sequelize.query("SELECT id FROM rooms", { type: queryInterface.sequelize.QueryTypes.SELECT });

    const admin = users.find((u) => u.role === "ADMIN");
    const client = users.find((u) => u.role === "CLIENT");

    await queryInterface.bulkInsert(
      "bookings",
      [
        {
          scheduledAt: new Date(Date.now() + 3600_000),
          status: "EM_ANALISE",
          createdByRole: "CLIENT",
          userId: client.id,
          roomId: rooms[0].id,
          createdAt: now,
          updatedAt: now
        },
        {
          scheduledAt: new Date(Date.now() + 7200_000),
          status: "AGENDADO",
          createdByRole: "ADMIN",
          userId: admin.id,
          roomId: rooms[1].id,
          createdAt: now,
          updatedAt: now
        }
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("bookings", null, {});
    await queryInterface.bulkDelete("rooms", null, {});
    await queryInterface.bulkDelete("users", null, {});
  }
};

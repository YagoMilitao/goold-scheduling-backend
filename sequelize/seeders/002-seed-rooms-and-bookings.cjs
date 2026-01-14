"use strict";

const bcrypt = require("bcryptjs");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkDelete("bookings", null, {});
    await queryInterface.bulkDelete("rooms", null, {});
    await queryInterface.bulkDelete("users", null, {});

    const adminHash = await bcrypt.hash("Admin@123", 10);
    const clientHash = await bcrypt.hash("Client@123", 10);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          name: "Admin Portal",
          email: "admin@portal.com",
          passwordHash: adminHash,
          role: "ADMIN",
          createdAt: now,
          updatedAt: now
        },
        {
          id: 2,
          name: "Cliente Demo",
          email: "cliente@portal.com",
          passwordHash: clientHash,
          role: "CLIENT",
          createdAt: now,
          updatedAt: now
        }
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "rooms",
      [
        { id: 1, name: "Sala 01", startTime: "08:00", endTime: "18:00", slotMinutes: 30, createdAt: now, updatedAt: now },
        { id: 2, name: "Sala 02", startTime: "09:00", endTime: "17:00", slotMinutes: 60, createdAt: now, updatedAt: now },
        { id: 3, name: "Sala 03", startTime: "10:00", endTime: "16:00", slotMinutes: 15, createdAt: now, updatedAt: now }
      ],
      {}
    );

    const base = new Date();
    base.setSeconds(0, 0);

    const d1 = new Date(base);
    d1.setDate(d1.getDate() + 1);
    d1.setHours(10, 0, 0, 0);

    const d2 = new Date(base);
    d2.setDate(d2.getDate() + 2);
    d2.setHours(11, 0, 0, 0);

    const d3 = new Date(base);
    d3.setDate(d3.getDate() + 3);
    d3.setHours(15, 30, 0, 0);

    await queryInterface.bulkInsert(
      "bookings",
      [
        {
          id: 1,
          scheduledAt: d1,
          status: "EM_ANALISE",
          createdByRole: "CLIENT",
          userId: 2,
          roomId: 1,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 2,
          scheduledAt: d2,
          status: "AGENDADO",
          createdByRole: "ADMIN",
          userId: 1,
          roomId: 2,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 3,
          scheduledAt: d3,
          status: "CANCELADO",
          createdByRole: "CLIENT",
          userId: 2,
          roomId: 3,
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

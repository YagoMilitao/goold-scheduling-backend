import { Room } from "../../models/Room";
import { sequelize } from "../../config/database";

export const seedRooms = async () => {
  await sequelize.authenticate();

  const rooms = [
    { name: "Sala 001", startTime: "08:00", endTime: "18:00", slotMinutes: 30 },
    { name: "Sala 002", startTime: "08:00", endTime: "18:00", slotMinutes: 30 },
    { name: "Sala 003", startTime: "09:00", endTime: "17:00", slotMinutes: 30 },
    { name: "Sala Reunião A", startTime: "08:00", endTime: "20:00", slotMinutes: 60 },
    { name: "Sala Atendimento 1", startTime: "09:00", endTime: "18:00", slotMinutes: 15 }
  ];

  for (const room of rooms) {
    await Room.findOrCreate({
      where: { name: room.name },
      defaults: room
    });
  }

  console.log("✅ Salas criadas com sucesso");
};

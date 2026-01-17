import { Op } from "sequelize";
import { Booking } from "../../models";
import { Room } from "../../models/Room";
import { AppError } from "../../shared/errors/AppError";

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const roomsService = {
  async list() {
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      startTime: r.startTime,
      endTime: r.endTime,
      slotMinutes: r.slotMinutes
    }));
  },

  async create(input: { name: string; startTime: string; endTime: string; slotMinutes: number }) {
    const start = timeToMinutes(input.startTime);
    const end = timeToMinutes(input.endTime);

    const isAligned30 = (t: string) => timeToMinutes(t) % 30 === 0;

    if (end <= start) throw new AppError("Horário final deve ser maior que o inicial", 422);
    if (input.slotMinutes !== 30) throw new AppError("Bloco inválido. Permitido apenas 30 minutos.", 422);
    if (!isAligned30(input.startTime) || !isAligned30(input.endTime)) {
      throw new AppError("Horários devem ser cadastrados de 30 em 30 minutos", 422);
    }

    const exists = await Room.findOne({ where: { name: input.name } });
    if (exists) throw new AppError("Já existe uma sala com esse nome", 409);

  const room = await Room.create({
    name: input.name,
    startTime: input.startTime,
    endTime: input.endTime,
    slotMinutes: input.slotMinutes
  });

  return {
    id: room.id,
    name: room.name,
    startTime: room.startTime,
    endTime: room.endTime,
    slotMinutes: room.slotMinutes
  };
  },


  async listAvailable(input: { date: string; time: string }) {

    const scheduledAt = new Date(`${input.date}T${input.time}:00`);
    const rooms = await Room.findAll({ order: [["name", "ASC"]] });
    
    const bookings = await Booking.findAll({
      where: {
        scheduledAt,
        status: { [Op.in]: ["EM_ANALISE", "AGENDADO"] }
      },
      attributes: ["roomId"]
    });
  
    const busy = new Set(bookings.map((b) => b.roomId));
  
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
  
    const t = toMinutes(input.time);
  
    return rooms.map((r) => {
      const withinHours = t >= toMinutes(r.startTime) && t <= toMinutes(r.endTime);
      const available = withinHours && !busy.has(r.id);
    
      return {
        id: r.id,
        name: r.name,
        startTime: r.startTime,
        endTime: r.endTime,
        slotMinutes: r.slotMinutes,
        available
      };
    });
  }

};

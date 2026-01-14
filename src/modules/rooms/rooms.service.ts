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

    if (end <= start) throw new AppError("Horário final deve ser maior que o inicial", 422);
    if (![15, 30, 60].includes(input.slotMinutes)) throw new AppError("Bloco inválido", 422);

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
  }
};

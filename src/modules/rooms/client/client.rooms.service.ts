import { Op } from "sequelize";
import { Room } from "../../../models/Room";
import { Booking } from "../../../models/Booking";
import { AppError } from "../../../shared/errors/AppError";

const isValidDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const isValidTime = (v: string) => /^\d{2}:\d{2}$/.test(v);

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const isWithinRoomHours = (time: string, start: string, end: string) => {
  const t = toMinutes(time);
  const s = toMinutes(start);
  const e = toMinutes(end);
  return t >= s && t <= e;
};

export const clientRoomsService = {
  async listAvailable({ date, time }: { date: string; time: string }) {
    if (!isValidDate(date)) throw new AppError("Parâmetro 'date' inválido (use YYYY-MM-DD)", 400);
    if (!isValidTime(time)) throw new AppError("Parâmetro 'time' inválido (use HH:MM)", 400);

    const scheduledAt = new Date(`${date}T${time}:00`);

    const rooms = await Room.findAll({ order: [["name", "ASC"]] });

    const bookings = await Booking.findAll({
      where: {
        scheduledAt,
        status: { [Op.in]: ["EM_ANALISE", "AGENDADO"] }
      },
      attributes: ["roomId"]
    });

    const bookedRoomIds = new Set(bookings.map((b) => b.roomId));

    const items = rooms.map((r) => {
      const withinHours = isWithinRoomHours(time, r.startTime, r.endTime);
      const booked = bookedRoomIds.has(r.id);
      const available = withinHours && !booked;

      return {
        id: r.id,
        name: r.name,
        startTime: r.startTime,
        endTime: r.endTime,
        slotMinutes: r.slotMinutes,
        available
      };
    });

    return { items };
  }
};

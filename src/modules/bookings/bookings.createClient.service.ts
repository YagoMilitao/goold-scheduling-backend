import { Booking } from "../../models/Booking";
import { Room } from "../../models/Room";
import { AppError } from "../../shared/errors/AppError";
import { Op } from "sequelize";

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const dateToMinutes = (d: Date) => d.getHours() * 60 + d.getMinutes();

const buildLocalDateFromDateTimeParts = (date: string, time: string) => {
  const [y, mo, da] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  const dt = new Date(y, mo - 1, da, hh, mm, 0, 0);
  if (Number.isNaN(dt.getTime())) throw new AppError("Data/hora inválida", 422);
  return dt;
};

const buildDateFromScheduledAt = (scheduledAt: string) => {
  const dt = new Date(scheduledAt);
  if (Number.isNaN(dt.getTime())) throw new AppError("scheduledAt inválido", 422);
  return dt;
};

export const createClientBookingService = {
  async execute(input: {
    roomId: number;
    scheduledAt?: string;
    date?: string;
    time?: string;
    userId: number;
  }) {
    const room = await Room.findByPk(input.roomId);
    if (!room) throw new AppError("Sala não encontrada", 404);

    const scheduled =
      input.scheduledAt
        ? buildDateFromScheduledAt(input.scheduledAt)
        : input.date && input.time
          ? buildLocalDateFromDateTimeParts(input.date, input.time)
          : null;

    if (!scheduled) throw new AppError("Informe scheduledAt ou date+time", 422);

    const start = timeToMinutes(room.startTime);
    const end = timeToMinutes(room.endTime);
    const at = dateToMinutes(scheduled);

    if (at < start || at >= end) throw new AppError("Horário fora do funcionamento da sala", 422);

    const slot = room.slotMinutes;
    const aligned = (at - start) % slot === 0;
    if (!aligned) throw new AppError("Horário não condiz com o bloco de agendamento da sala", 422);

    const conflict = await Booking.findOne({
      where: {
        roomId: room.id,
        scheduledAt: scheduled,
        status: { [Op.in]: ["EM_ANALISE", "AGENDADO"] }
      }
    });

    if (conflict) throw new AppError("Já existe um agendamento para esse horário nessa sala", 409);

    const booking = await Booking.create({
      scheduledAt: scheduled,
      status: "EM_ANALISE",
      createdByRole: "CLIENT",
      userId: input.userId,
      roomId: room.id
    });

    return { id: booking.id };
  }
};

import { Booking } from "../../models/Booking";
import { Room } from "../../models/Room";
import { User } from "../../models/User";
import { AppError } from "../../shared/errors/AppError";
import { BookingListOrder } from "./bookings.types";

export const bookingsService = {
  async list(order: BookingListOrder) {
    const direction = order === "asc" ? "ASC" : "DESC";

    const items = await Booking.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "name", "role"] },
        { model: Room, as: "room", attributes: ["id", "name"] }
      ],
      order: [["scheduledAt", direction]]
    });

    return items.map((b) => ({
      id: b.id,
      scheduledAt: b.scheduledAt,
      status: b.status,
      createdByRole: b.createdByRole,
      user: (b as any).user,
      room: (b as any).room
    }));
  },

  async confirm(id: number) {
    const booking = await Booking.findByPk(id);
    if (!booking) throw new AppError("Agendamento não encontrado", 404);

    if (booking.status !== "EM_ANALISE") {
      throw new AppError("Apenas agendamentos em análise podem ser confirmados", 409);
    }

    booking.status = "AGENDADO";
    await booking.save();

    return { id: booking.id, status: booking.status };
  },

  async cancel(id: number) {
    const booking = await Booking.findByPk(id);
    if (!booking) throw new AppError("Agendamento não encontrado", 404);

    if (booking.status !== "EM_ANALISE") {
      throw new AppError("Apenas agendamentos em análise podem ser cancelados", 409);
    }

    booking.status = "CANCELADO";
    await booking.save();

    return { id: booking.id, status: booking.status };
  }
};

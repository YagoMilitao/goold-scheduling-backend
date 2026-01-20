import { Booking } from "../../models/Booking";
import { AppError } from "../../shared/errors/AppError";
import { Op } from "sequelize";

export const cancelClientBookingService = {
  async execute(input: { id: number; userId: number }) {
    const booking = await Booking.findOne({
      where: {
        id: input.id,
        userId: input.userId,
        status: { [Op.in]: ["EM_ANALISE", "AGENDADO"] }
      }
    });

    if (!booking) throw new AppError("Agendamento não encontrado ou não pode ser cancelado", 404);

    booking.status = "CANCELADO";
    await booking.save();

    return { id: booking.id, status: booking.status };
  }
};

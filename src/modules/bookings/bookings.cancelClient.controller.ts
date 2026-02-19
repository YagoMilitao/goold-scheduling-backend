import { Request, Response } from "express";
import { cancelClientBookingService } from "./bookings.cancelClient.service";
import { logsService } from "../logs/logs.service";

export const cancelClientBookingController = {
  async handle(req: Request, res: Response) {
    const { id } = (req as any).validated.params as { id: string };
    const userId = (req as any).auth.sub as number;

    const result = await cancelClientBookingService.execute({ id: Number(id), userId });

    await logsService.create({
      userId,
      module: "AGENDAMENTOS",
      activityType: "Cancelamento de agendamento",
      meta: { bookingId: result.id }
    });

    res.status(200).json(result);
  }
};

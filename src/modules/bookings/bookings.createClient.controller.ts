import { Request, Response } from "express";
import { createClientBookingService } from "./bookings.createClient.service";
import { logsService } from "../logs/logs.service";
import { AppError } from "../../shared/errors/AppError";

type CreateBookingBody =
  | { roomId: number; date: string; time: string }
  | { roomId: number; scheduledAt: string };

function toDateTimePartsFromScheduledAt(scheduledAt: string) {
  const d = new Date(scheduledAt);

  if (Number.isNaN(d.getTime())) throw new AppError("scheduledAt inválido", 422);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const date = `${yyyy}-${mm}-${dd}`;

  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const time = `${hh}:${mi}`;

  return { date, time };
}

export const createClientBookingController = {
  async handle(req: Request, res: Response) {
    const userId = (req as any).auth.sub as number;

    const body = (req as any).validated?.body as CreateBookingBody | undefined;
    if (!body) throw new AppError("Body inválido", 422);

    const roomId = body.roomId;

    let date: string;
    let time: string;

    if ("scheduledAt" in body) {
      const parts = toDateTimePartsFromScheduledAt(body.scheduledAt);
      date = parts.date;
      time = parts.time;
    } else {
      date = body.date;
      time = body.time;
    }

    const result = await createClientBookingService.execute({ date, time, roomId, userId });

    await logsService.create({
      userId,
      module: "AGENDAMENTOS",
      activityType: "Criação de agendamento",
      meta: { bookingId: result.id, roomId, date, time }
    });

    res.status(201).json(result);
  }
};

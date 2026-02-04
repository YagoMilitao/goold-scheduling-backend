import { Request, Response } from "express";
import { createClientBookingService } from "./bookings.createClient.service";
import { logsService } from "../logs/logs.service";

export const createClientBookingController = {
  async handle(req: Request, res: Response) {
    const body = (req as any).validated.body as {
      roomId: number;
      scheduledAt?: string;
      date?: string;
      time?: string;
    };

    const userId = (req as any).auth.sub as number;

    const result = await createClientBookingService.execute({
      roomId: body.roomId,
      scheduledAt: body.scheduledAt,
      date: body.date,
      time: body.time,
      userId
    });

    await logsService.create({
      userId,
      module: "AGENDAMENTOS",
      activityType: "Criação de agendamento",
      meta: {
        bookingId: result.id,
        roomId: body.roomId,
        scheduledAt: body.scheduledAt ?? null,
        date: body.date ?? null,
        time: body.time ?? null
      }
    });

    res.status(201).json(result);
  }
};

import { Request, Response } from "express";
import { createClientBookingService } from "./bookings.createClient.service";
import { logsService } from "../logs/logs.service";

export const createClientBookingController = {
  async handle(req: Request, res: Response) {
    console.log("AUTH =>", (req as any).auth);
    console.log("VALIDATED BODY =>", (req as any).validated?.body);
    console.log("RAW BODY =>", req.body);
    
    const { date, time, roomId } = (req as any).validated.body as { date: string; time: string; roomId: number };
    const userId = (req as any).auth.sub as number;

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

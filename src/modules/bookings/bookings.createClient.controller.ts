import { Request, Response } from "express";
import { createClientBookingService } from "./bookings.createClient.service";

export const createClientBookingController = {
  async handle(req: Request, res: Response) {
    const { scheduledAt, roomId } = (req as any).validated.body as { scheduledAt: string; roomId: number };
    const userId = (req as any).auth.sub as number;

    const result = await createClientBookingService.execute({ scheduledAt, roomId, userId });

    res.status(201).json(result);
  }
};

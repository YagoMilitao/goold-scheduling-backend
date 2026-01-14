import { Request, Response } from "express";
import { listClientBookingsService } from "./bookings.listClient.service";

export const listClientBookingsController = {
  async handle(req: Request, res: Response) {
    const userId = (req as any).auth.sub as number;
    const result = await listClientBookingsService.execute({ userId });
    res.status(200).json(result);
  }
};

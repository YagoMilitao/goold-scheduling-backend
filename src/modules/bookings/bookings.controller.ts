import { Request, Response } from "express";
import { bookingsService } from "./bookings.service";

export const bookingsController = {
  async list(req: Request, res: Response) {
    const { order } = (req as any).validated.query as { order?: "asc" | "desc" };
    const items = await bookingsService.list(order ?? "desc");
    res.status(200).json({ items });
  },

  async confirm(req: Request, res: Response) {
    const { id } = (req as any).validated.params as { id: string };
    const result = await bookingsService.confirm(Number(id));
    res.status(200).json(result);
  },

  async cancel(req: Request, res: Response) {
    const { id } = (req as any).validated.params as { id: string };
    const result = await bookingsService.cancel(Number(id));
    res.status(200).json(result);
  }
};

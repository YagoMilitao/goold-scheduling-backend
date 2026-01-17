import { Request, Response } from "express";
import { roomsService } from "../rooms.service";

export const clientRoomsController = {
  async list(_req: Request, res: Response) {
    const items = await roomsService.list();
    res.status(200).json({ items });
  },

  async create(req: Request, res: Response) {
    const { name, startTime, endTime, slotMinutes } = (req as any).validated.body as {
      name: string;
      startTime: string;
      endTime: string;
      slotMinutes: number;
    };

    const room = await roomsService.create({ name, startTime, endTime, slotMinutes });
    res.status(201).json(room);
  }
};

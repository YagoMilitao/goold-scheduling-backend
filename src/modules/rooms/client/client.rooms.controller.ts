import { Request, Response } from "express";
import { Room } from "../../../models/Room";

export const clientRoomsController = {
  async list(_req: Request, res: Response) {
    const rooms = await Room.findAll({
      attributes: ["id", "name", "startTime", "endTime", "slotMinutes"],
      order: [["id", "ASC"]]
    });

    return res.status(200).json({ items: rooms });
  },

  async create(req: Request, res: Response) {
    const body = (req as any).validated?.body ?? req.body;

    const created = await Room.create({
      name: body.name,
      startTime: body.startTime,
      endTime: body.endTime,
      slotMinutes: body.slotMinutes
    });

    return res.status(201).json({ item: created });
  }
};
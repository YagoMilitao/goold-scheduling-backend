import { Request, Response } from "express";
import { meService } from "./me.service";

export const meController = {
  async get(req: Request, res: Response) {
    const userId = (req as any).auth.sub as number;
    const result = await meService.get(userId);
    res.status(200).json(result);
  },

  async update(req: Request, res: Response) {
    const userId = (req as any).auth.sub as number;
    const body = (req as any).validated.body as any;

    const result = await meService.update(userId, body);
    res.status(200).json(result);
  }
};

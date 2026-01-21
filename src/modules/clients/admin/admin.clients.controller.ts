import { Request, Response } from "express";
import { adminClientsService } from "./admin.clients.service";

export const adminClientsController = {
  async list(req: Request, res: Response) {
    const { order, q } = (req as any).validated.query as { order?: "asc" | "desc"; q?: string };
    const items = await adminClientsService.list(order ?? "desc", q);
    res.status(200).json({ items });
  },

  async toggleStatus(req: Request, res: Response) {
    const { id } = (req as any).validated.params as { id: string };
    const result = await adminClientsService.toggleStatus(Number(id));
    res.status(200).json(result);
  },

  async togglePermissions(req: Request, res: Response) {
    const { id } = (req as any).validated.params as { id: string };
    const { permission } = (req as any).validated.body as { permission: "canViewBookings" | "canViewLogs" };

    const result = await adminClientsService.togglePermission(Number(id), permission);
    res.status(200).json(result);
  }
};

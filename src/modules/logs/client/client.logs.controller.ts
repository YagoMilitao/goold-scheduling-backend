import { Request, Response } from "express";
import { logsService } from "../logs.service";

export const clientLogsController = {
  async list(req: Request, res: Response) {
    const userId = (req as any).auth.sub as number;
    const order = (req.query.order as "asc" | "desc" | undefined) ?? "desc";

    const items = await logsService.listByUser({ userId, order });
    res.status(200).json({ items });
  }
};

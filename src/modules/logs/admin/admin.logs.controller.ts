import { Request, Response } from "express";
import { adminLogsService } from "./admin.logs.service";

export const adminLogsController = {
  async list(req: Request, res: Response) {
    const { order = "desc", q } = (req as any).validated.query as {
      order?: "asc" | "desc";
      q?: string;
    };

    const items = await adminLogsService.list({ order, q });
    res.status(200).json({ items });
  }
};

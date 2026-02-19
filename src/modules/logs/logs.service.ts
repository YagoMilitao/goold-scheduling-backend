import { Log } from "../../models/Log";

export type LogModule = "AGENDAMENTOS" | "MINHA_CONTA" | "LOGS";

export const logsService = {
  async create(input: { userId: number; module: LogModule; activityType: string; meta?: any }) {
    await Log.create({
      userId: input.userId,
      module: input.module,
      activityType: input.activityType,
      meta: input.meta ?? null
    });
  },

  async listByUser(input: { userId: number; order?: "asc" | "desc" }) {
    const direction = (input.order ?? "desc").toUpperCase() as "ASC" | "DESC";

    const rows = await Log.findAll({
      where: { userId: input.userId },
      order: [["createdAt", direction]]
    });

    return rows.map((r: any) => ({
      id: r.id,
      activityType: r.activityType,
      module: r.module,
      meta: r.meta ?? null,
      createdAt: r.createdAt
    }));
  }
};

import { Log } from "../../../models/Log";
import { User } from "../../../models/User";

export const adminLogsService = {
  async list(input: { order: "asc" | "desc"; q?: string }) {
    const direction = input.order === "asc" ? "ASC" : "DESC";

    const where: any = {};
    if (input.q?.trim()) {
      const term = input.q.trim();
      where.$or = [
        { activityType: { $like: `%${term}%` } },
        { module: { $like: `%${term}%` } }
      ];
    }

    const items = await Log.findAll({
      include: [{ model: User, as: "user", attributes: ["id", "name", "role"] }],
      order: [["createdAt", direction]]
    });

    const filtered = input.q?.trim()
      ? items.filter((x: any) => {
          const term = input.q!.trim().toLowerCase();
          const userName = String(x.user?.name ?? "").toLowerCase();
          const act = String(x.activityType ?? "").toLowerCase();
          const mod = String(x.module ?? "").toLowerCase();
          return userName.includes(term) || act.includes(term) || mod.includes(term);
        })
      : items;

    return filtered.map((l: any) => ({
      id: l.id,
      createdAt: l.createdAt,
      activityType: l.activityType,
      module: l.module,
      user: l.user
    }));
  }
};

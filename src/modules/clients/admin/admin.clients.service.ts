import { Op } from "sequelize";
import { User } from "../../../models/User";
import { AppError } from "../../../shared/errors/AppError";

type Order = "asc" | "desc";

export const adminClientsService = {
  async list(order: Order, q?: string) {
    const direction = order === "asc" ? "ASC" : "DESC";

    const where: any = { role: "CLIENT" };

    const term = (q ?? "").trim();
    if (term) {
      where[Op.or] = [
        { name: { [Op.like]: `%${term}%` } },
        { lastName: { [Op.like]: `%${term}%` } },
        { email: { [Op.like]: `%${term}%` } }
      ];
    }

    const clients = await User.findAll({
      where,
      order: [["createdAt", direction]]
    });

    return clients.map((u) => ({
      id: u.id,
      name: u.name,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      cep: u.cep,
      address: u.address,
      number: u.number,
      complement: u.complement,
      neighborhood: u.neighborhood,
      city: u.city,
      state: u.state,
      createdAt: u.createdAt,
      isActive: (u as any).isActive,
      canViewBookings: (u as any).canViewBookings,
      canViewLogs: (u as any).canViewLogs
    }));
  },

  async toggleStatus(id: number) {
    const user = await User.findByPk(id);
    if (!user) throw new AppError("Cliente não encontrado", 404);
    if (user.role !== "CLIENT") throw new AppError("Usuário não é cliente", 409);

    const current = Boolean((user as any).isActive);
    (user as any).isActive = !current;
    await user.save();

    return { id: user.id, isActive: Boolean((user as any).isActive) };
  },

  async togglePermission(id: number, perm: "canViewBookings" | "canViewLogs") {
    const user = await User.findByPk(id);
    if (!user) throw new AppError("Cliente não encontrado", 404);
    if (user.role !== "CLIENT") throw new AppError("Usuário não é cliente", 409);

    const current = Boolean((user as any)[perm]);
    (user as any)[perm] = !current;
    await user.save();

    return {
      id: user.id,
      canViewBookings: Boolean((user as any).canViewBookings),
      canViewLogs: Boolean((user as any).canViewLogs)
    };
  }
};

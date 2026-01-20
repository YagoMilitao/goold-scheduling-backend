import bcrypt from "bcryptjs";
import { User } from "../../models/User";
import { AppError } from "../../shared/errors/AppError";
import { logsService } from "../logs/logs.service";

type UpdateMeInput = {
  name: string;
  lastName: string;
  email: string;
  password?: string;
  cep: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  number?: string;
  complement?: string;
};

export const meService = {
  async get(userId: number) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: (user as any).lastName,
        email: user.email,
        cep: (user as any).cep,
        address: (user as any).address,
        neighborhood: (user as any).neighborhood,
        city: (user as any).city,
        state: (user as any).state,
        number: (user as any).number ?? "",
        complement: (user as any).complement ?? ""
      }
    };
  },

  async update(userId: number, input: UpdateMeInput) {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError("Usuário não encontrado", 404);

    const emailLower = input.email.trim().toLowerCase();
    const exists = await User.findOne({ where: { email: emailLower } });

    if (exists && exists.id !== user.id) {
      throw new AppError("Este e-mail já está em uso", 409);
    }

    user.name = input.name.trim();
    (user as any).lastName = input.lastName.trim();
    user.email = emailLower;

    (user as any).cep = input.cep;
    (user as any).address = input.address.trim();
    (user as any).neighborhood = input.neighborhood.trim();
    (user as any).city = input.city.trim();
    (user as any).state = input.state.trim();
    (user as any).number = input.number?.trim() || null;
    (user as any).complement = input.complement?.trim() || null;

    if (input.password && input.password.trim().length > 0) {
      const hash = await bcrypt.hash(input.password, 10);
      (user as any).passwordHash = hash;
    }

    await user.save();

    await logsService.create({
      userId: user.id,
      module: "MINHA_CONTA",
      activityType: "Atualização de dados"
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: (user as any).lastName,
        email: user.email,
        cep: (user as any).cep,
        address: (user as any).address,
        neighborhood: (user as any).neighborhood,
        city: (user as any).city,
        state: (user as any).state,
        number: (user as any).number ?? "",
        complement: (user as any).complement ?? ""
      }
    };
  }
};

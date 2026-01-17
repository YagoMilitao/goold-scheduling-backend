import jwt from "jsonwebtoken";
import { env } from "../../../config/env";
import { AppError } from "../../../shared/errors/AppError";
import { comparePassword, hashPassword } from "../../../shared/utils/password";
import { User } from "../../../models/User";
import { JwtPayload } from "../admin/admin.auth.types";

export const clientAuthService = {
  async emailExists(email: string) {
    const user = await User.findOne({ where: { email } });
    return { exists: !!user };
  },

  async login(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new AppError("Email ou senha estão errados", 401);
    if (user.role !== "CLIENT") throw new AppError("Email ou senha estão errados", 401);

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new AppError("Email ou senha estão errados", 401);

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const token = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },

  async register(input: {
    name: string;
    lastName: string;
    email: string;
    password: string;
    cep: string;
    address: string;
    neighborhood: string;
    city: string;
    state: string;
    number?: string;
    complement?: string;
  }) {
    const exists = await User.findOne({ where: { email: input.email } });
    if (exists) throw new AppError("Email já cadastrado", 409);

    const passwordHash = await hashPassword(input.password);

    const user = await User.create({
      name: input.name,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: "CLIENT",
      cep: input.cep,
      address: input.address,
      neighborhood: input.neighborhood,
      city: input.city,
      state: input.state,
      number: input.number ?? null,
      complement: input.complement ?? null
    });

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };
    const token = jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
};

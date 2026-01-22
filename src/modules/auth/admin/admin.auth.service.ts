import jwt from "jsonwebtoken";
import { env } from "../../../config/env";
import { AppError } from "../../../shared/errors/AppError";
import { comparePassword } from "../../../shared/utils/password";
import { User } from "../../../models/User";
import { JwtPayload } from "../auth.types";


export const adminAuthService = {
  async loginAdmin(email: string, password: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) throw new AppError("Credenciais inválidas", 401);
    if (user.role !== "ADMIN") throw new AppError("Acesso permitido apenas para admin", 403);

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new AppError("Credenciais inválidas", 401);

    const payload: JwtPayload = { sub: user.id, role: user.role, email: user.email };

    const token = jwt.sign(payload, env.jwt.secret as jwt.Secret, {
      expiresIn: env.jwt.expiresIn
    });

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
  }
};

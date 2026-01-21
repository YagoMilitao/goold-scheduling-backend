import { NextFunction, Request, Response } from "express";
import { User } from "../../models/User";
import { AppError } from "../errors/AppError";

export const requireActiveClient = async (req: Request, _res: Response, next: NextFunction) => {
  const auth = (req as any).auth as { sub: number; role: "ADMIN" | "CLIENT" } | undefined;
  if (!auth?.sub) return next(new AppError("Token inválido", 401));

  const user = await User.findByPk(auth.sub);
  if (!user) return next(new AppError("Usuário não encontrado", 404));
  if (!user.isActive) return next(new AppError("Usuário desativado", 403));

  (req as any).currentUser = user;
  next();
};

export const requireClientPermission =
  (perm: "canViewBookings" | "canViewLogs") => (req: Request, _res: Response, next: NextFunction) => {
    const user = (req as any).currentUser as User | undefined;
    if (!user) return next(new AppError("Usuário não carregado", 500));

    if (user.role !== "CLIENT") return next(new AppError("Sem permissão", 403));
    if (!(user as any)[perm]) return next(new AppError("Sem permissão", 403));

    next();
  };

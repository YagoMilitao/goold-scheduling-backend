import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";
import { JwtPayload } from "../../modules/auth/auth.types";


function isJwtPayload(value: unknown): value is JwtPayload {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;

  return (
    typeof v.sub === "number" &&
    (v.role === "ADMIN" || v.role === "CLIENT") &&
    typeof v.email === "string"
  );
}

export const requireAuth =
  (roles?: Array<JwtPayload["role"]>) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return next(new AppError("Token ausente", 401));

    const token = header.slice("Bearer ".length);

    try {
      const decoded = jwt.verify(token, env.jwt.secret) as unknown;

      if (!isJwtPayload(decoded)) {
        return next(new AppError("Token inválido", 401));
      }

      (req as any).auth = decoded;

      if (roles && !roles.includes(decoded.role)) {
        return next(new AppError("Sem permissão", 403));
      }

      return next();
    } catch {
      return next(new AppError("Token inválido", 401));
    }
  };

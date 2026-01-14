import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/AppError";

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("ERROR =>", err);
  const isAppError = err instanceof AppError;

  const status = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal server error";
  const details = isAppError ? err.details : undefined;

  res.status(status).json({ message, details });
};

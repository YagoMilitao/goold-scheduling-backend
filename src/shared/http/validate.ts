import { RequestHandler } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../errors/AppError";

export const validate =
  (schema: ZodSchema): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!result.success) {
      return next(new AppError("Validation error", 422, result.error.flatten()));
    }

    (req as any).validated = result.data;
    next();
  };

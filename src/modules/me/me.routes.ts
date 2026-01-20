import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { requireAuth } from "../../shared/middleware/auth.middleware";
import { meController } from "./me.controller";

const router = Router();

const timeSafeCep = z.string().min(8).max(9);
const optionalStr = z.string().trim().min(1).optional();

const updateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    lastName: z.string().trim().min(2).max(120),
    email: z.string().trim().email(),
    password: z.string().min(6).max(120).optional(),
    cep: timeSafeCep,
    address: z.string().trim().min(2).max(180),
    neighborhood: z.string().trim().min(2).max(120),
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(120),
    number: optionalStr,
    complement: z.string().trim().max(80).optional()
  }),
  params: z.any().optional(),
  query: z.any().optional()
});

router.get("/me", requireAuth(["CLIENT"]), asyncHandler(meController.get));
router.patch("/me", requireAuth(["CLIENT"]), validate(updateSchema), asyncHandler(meController.update));

export default router;

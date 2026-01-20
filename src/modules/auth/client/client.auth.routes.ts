import { Router } from "express";
import { z } from "zod";
import { validate } from "../../../shared/http/validate";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { clientAuthController } from "./client.auth.controller";
import { requireAuth } from "../../../shared/middleware/auth.middleware";


const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  params: z.any().optional(),
  query: z.any().optional()
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    lastName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(6).max(120),
    cep: z.string().min(8).max(9),
    address: z.string().min(2).max(180),
    neighborhood: z.string().min(2).max(120),
    city: z.string().min(2).max(120),
    state: z.string().min(2).max(120),
    number: z.string().max(20).optional(),
    complement: z.string().max(80).optional()
  }),
  params: z.any().optional(),
  query: z.any().optional()
});


router.get("/auth/email-exists", asyncHandler(clientAuthController.emailExists));
router.post("/auth/login", validate(loginSchema), asyncHandler(clientAuthController.login));
router.post("/auth/register", validate(registerSchema), asyncHandler(clientAuthController.register));
router.post("/auth/logout", requireAuth(["CLIENT"]), asyncHandler(clientAuthController.logout));

export default router;

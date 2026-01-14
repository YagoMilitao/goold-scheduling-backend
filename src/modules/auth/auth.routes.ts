import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { authController } from "./auth.controller";

const router = Router();

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

router.post("/admin/login", validate(loginSchema), asyncHandler(authController.loginAdmin));

export default router;

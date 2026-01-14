import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { bookingsController } from "./bookings.controller";
import { requireAuth } from "../../shared/middleware/auth.middleware";

const router = Router();

const listSchema = z.object({
  query: z.object({
    order: z.enum(["asc", "desc"]).optional()
  }),
  body: z.any().optional(),
  params: z.any().optional()
});

const idSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.any().optional(),
  query: z.any().optional()
});

router.get("/admin/bookings", requireAuth(["ADMIN"]), validate(listSchema), asyncHandler(bookingsController.list));
router.patch("/admin/bookings/:id/confirm", requireAuth(["ADMIN"]), validate(idSchema), asyncHandler(bookingsController.confirm));
router.patch("/admin/bookings/:id/cancel", requireAuth(["ADMIN"]), validate(idSchema), asyncHandler(bookingsController.cancel));

export default router;

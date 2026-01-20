import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { bookingsController } from "./bookings.controller";
import { requireAuth } from "../../shared/middleware/auth.middleware";
import { createClientBookingController } from "./bookings.createClient.controller";
import { listClientBookingsController } from "./bookings.listClient.controller";
import { cancelClientBookingController } from "./bookings.cancelClient.controller";

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

const createClientSchema = z.object({
  body: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    roomId: z.number().int().positive()
  }),
  params: z.any().optional(),
  query: z.any().optional()
});

const clientCancelSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.any().optional(),
  query: z.any().optional()
});

router.get("/bookings", requireAuth(["CLIENT"]), asyncHandler(listClientBookingsController.handle));
router.post("/bookings", requireAuth(["CLIENT"]), validate(createClientSchema), asyncHandler(createClientBookingController.handle));
router.get("/admin/bookings", requireAuth(["ADMIN"]), validate(listSchema), asyncHandler(bookingsController.list));
router.patch("/admin/bookings/:id/confirm", requireAuth(["ADMIN"]), validate(idSchema), asyncHandler(bookingsController.confirm));
router.patch("/admin/bookings/:id/cancel", requireAuth(["ADMIN"]), validate(idSchema), asyncHandler(bookingsController.cancel));
router.patch("/bookings/:id/cancel",requireAuth(["CLIENT"]),validate(clientCancelSchema),asyncHandler(cancelClientBookingController.handle));

export default router;

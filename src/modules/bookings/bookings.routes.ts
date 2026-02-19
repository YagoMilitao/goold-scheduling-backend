import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { bookingsController } from "./bookings.controller";
import { requireAuth } from "../../shared/middleware/auth.middleware";
import { createClientBookingController } from "./bookings.createClient.controller";
import { listClientBookingsController } from "./bookings.listClient.controller";
import { cancelClientBookingController } from "./bookings.cancelClient.controller";
import { requireActiveClient, requireClientPermission } from "../../shared/middleware/permission.middleware";

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

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const scheduledAtRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

// Caso 1: cliente manda date + time
const createByDateTimeSchema = z.object({
  roomId: z.number().int().positive(),
  date: z.string().regex(dateRegex),
  time: z.string().regex(timeRegex)
});

// Caso 2: cliente manda scheduledAt
const createByScheduledAtSchema = z.object({
  roomId: z.number().int().positive(),
  scheduledAt: z.string().regex(scheduledAtRegex)
});

// body agora é UNION: ou um ou outro
const createClientSchema = z.object({
  body: z.union([createByDateTimeSchema, createByScheduledAtSchema]),
  params: z.any().optional(),
  query: z.any().optional()
});

const clientCancelSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.any().optional(),
  query: z.any().optional()
});

router.get(
  "/bookings",
  requireAuth(["CLIENT"]),
  requireActiveClient,
  requireClientPermission("canViewBookings"),
  asyncHandler(listClientBookingsController.handle)
);

router.post(
  "/bookings",
  requireAuth(["CLIENT"]),
  requireActiveClient,
  requireClientPermission("canViewBookings"),
  validate(createClientSchema),
  asyncHandler(createClientBookingController.handle)
);

router.get(
  "/admin/bookings",
  requireAuth(["ADMIN"]),
  validate(listSchema),
  asyncHandler(bookingsController.list)
);

router.patch(
  "/admin/bookings/:id/confirm",
  requireAuth(["ADMIN"]),
  validate(idSchema),
  asyncHandler(bookingsController.confirm)
);

router.patch(
  "/admin/bookings/:id/cancel",
  requireAuth(["ADMIN"]),
  validate(idSchema),
  asyncHandler(bookingsController.cancel)
);

router.patch(
  "/bookings/:id/cancel",
  requireAuth(["CLIENT"]),
  requireActiveClient,
  requireClientPermission("canViewBookings"),
  validate(clientCancelSchema),
  asyncHandler(cancelClientBookingController.handle)
);

export default router;

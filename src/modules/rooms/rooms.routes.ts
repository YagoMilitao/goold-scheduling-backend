import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { requireAuth } from "../../shared/middleware/auth.middleware";
import { roomsController } from "./rooms.controller";

const router = Router();

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
    slotMinutes: z.number().int().positive()
  }),
  params: z.any().optional(),
  query: z.any().optional()
});

router.get("/rooms", asyncHandler(roomsController.list));
router.get("/admin/rooms", requireAuth(["ADMIN"]), asyncHandler(roomsController.list));
router.post("/admin/rooms", requireAuth(["ADMIN"]), validate(createSchema), asyncHandler(roomsController.create));

export default router;

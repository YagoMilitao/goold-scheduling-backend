import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { requireAuth } from "../../shared/middleware/auth.middleware";
import { clientRoomsController } from "./client/client.rooms.controller";
import { roomsService } from "./rooms.service";

const router = Router();

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const createSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(120),
    startTime: z.string().regex(timeRegex),
    endTime: z.string().regex(timeRegex),
    slotMinutes: z.literal(30)
  }),
  params: z.any().optional(),
  query: z.any().optional()
});

const availableSchema = z.object({
  body: z.any().optional(),
  params: z.any().optional(),
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)
  })
});

router.get(
  "/rooms/available",
  requireAuth(["CLIENT"]),
  validate(availableSchema),
  asyncHandler(async (req, res) => {
    const { date, time } = (req as any).validated.query as { date: string; time: string };
    const items = await roomsService.listAvailable({ date, time });
    res.status(200).json({ items });
  })
);


router.get("/rooms", requireAuth(["CLIENT", "ADMIN"]), asyncHandler(clientRoomsController.list));
router.get("/admin/rooms", requireAuth(["ADMIN"]), asyncHandler(clientRoomsController.list));
router.post("/admin/rooms", requireAuth(["ADMIN"]), validate(createSchema), asyncHandler(clientRoomsController.create));

export default router;
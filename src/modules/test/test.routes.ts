import { Router } from "express";
import { z } from "zod";
import { validate } from "../../shared/http/validate";
import { asyncHandler } from "../../shared/http/asyncHandler";
import { hashPassword } from "../../shared/utils/password";
import { User } from "../../models/User";
import { Room } from "../../models/Room";
import { Booking } from "../../models/Booking";
import { Log } from "../../models/Log";

const router = Router();

const seedSchema = z.object({
  body: z
    .object({
      adminEmail: z.string().email().optional(),
      clientEmail: z.string().email().optional(),
      adminPassword: z.string().min(6).optional(),
      clientPassword: z.string().min(6).optional(),
      roomName: z.string().min(1).max(120).optional(),
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
      slotMinutes: z.literal(30).optional()
    })
    .optional(),
  params: z.any().optional(),
  query: z.any().optional()
});

router.post(
  "/test/reset",
  asyncHandler(async (_req, res) => {
    // Limpa em ordem (dependências): logs -> bookings -> rooms -> users
    await Log.destroy({ where: {} });
    await Booking.destroy({ where: {} });
    await Room.destroy({ where: {} });
    await User.destroy({ where: {} });

    res.status(200).json({ ok: true });
  })
);

router.post(
  "/test/seed",
  validate(seedSchema),
  asyncHandler(async (req, res) => {
    const uid = Date.now();

    const body = ((req as any).validated?.body ?? {}) as {
      adminEmail?: string;
      clientEmail?: string;
      adminPassword?: string;
      clientPassword?: string;
      roomName?: string;
      startTime?: string;
      endTime?: string;
      slotMinutes?: 30;
    };

    const adminEmail = body.adminEmail ?? `admin-${uid}@portal.com`;
    const clientEmail = body.clientEmail ?? `client-${uid}@portal.com`;

    const adminPassword = body.adminPassword ?? "Admin@123";
    const clientPassword = body.clientPassword ?? "Client@123";

    const roomName = body.roomName ?? `Sala E2E ${uid}`;
    const startTime = body.startTime ?? "08:00";
    const endTime = body.endTime ?? "18:00";
    const slotMinutes = body.slotMinutes ?? 30;

    const adminPasswordHash = await hashPassword(adminPassword);
    const clientPasswordHash = await hashPassword(clientPassword);

    // Cria ADMIN
    const admin = await User.create({
      name: "Admin",
      lastName: "E2E",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: "ADMIN",

      // se seu model tiver esses campos, ok; se não tiver, remova.
      isActive: true,
      canViewBookings: true,
      canViewLogs: true
    } as any);

    // Cria CLIENT
    const client = await User.create({
      name: "Client",
      lastName: "E2E",
      email: clientEmail,
      passwordHash: clientPasswordHash,
      role: "CLIENT",

      isActive: true,
      canViewBookings: true,
      canViewLogs: true
    } as any);

    // Cria ROOM
    const room = await Room.create({
      name: roomName,
      startTime,
      endTime,
      slotMinutes
    });

    res.status(201).json({
      admin: { id: admin.id, email: adminEmail, password: adminPassword },
      client: { id: client.id, email: clientEmail, password: clientPassword },
      room: { id: room.id, name: room.name, startTime: room.startTime, endTime: room.endTime, slotMinutes: room.slotMinutes }
    });
  })
);

export default router;

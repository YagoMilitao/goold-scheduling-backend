import { Router } from "express";
import { z } from "zod";
import { validate } from "../../../shared/http/validate";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { requireAuth } from "../../../shared/middleware/auth.middleware";
import { adminClientsController } from "./admin.clients.controller";

const router = Router();

const listSchema = z.object({
  query: z.object({
    order: z.enum(["asc", "desc"]).optional(),
    q: z.string().optional()
  }),
  params: z.any().optional(),
  body: z.any().optional()
});

const idSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  query: z.any().optional(),
  body: z.any().optional()
});

const togglePermissionsSchema = z.object({
  params: z.object({ id: z.string().regex(/^\d+$/) }),
  body: z.object({
    permission: z.enum(["canViewBookings", "canViewLogs"])
  }),
  query: z.any().optional()
});

router.get("/admin/clients", requireAuth(["ADMIN"]), validate(listSchema), asyncHandler(adminClientsController.list));
router.patch("/admin/clients/:id/status", requireAuth(["ADMIN"]), validate(idSchema), asyncHandler(adminClientsController.toggleStatus));
router.patch(
  "/admin/clients/:id/permissions",
  requireAuth(["ADMIN"]),
  validate(togglePermissionsSchema),
  asyncHandler(adminClientsController.togglePermissions)
);

export default router;

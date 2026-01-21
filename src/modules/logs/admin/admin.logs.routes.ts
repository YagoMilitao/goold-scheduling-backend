import { Router } from "express";
import { z } from "zod";
import { validate } from "../../../shared/http/validate";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { requireAuth } from "../../../shared/middleware/auth.middleware";
import { adminLogsController } from "./admin.logs.controller";

const router = Router();

const listSchema = z.object({
  query: z.object({
    order: z.enum(["asc", "desc"]).optional(),
    q: z.string().optional()
  }),
  params: z.any().optional(),
  body: z.any().optional()
});

router.get("/admin/logs", requireAuth(["ADMIN"]), validate(listSchema), asyncHandler(adminLogsController.list));

export default router;

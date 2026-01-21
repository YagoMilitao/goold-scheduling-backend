import { Router } from "express";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { requireAuth } from "../../../shared/middleware/auth.middleware";
import { clientLogsController } from "./client.logs.controller";
import { requireActiveClient, requireClientPermission } from "../../../shared/middleware/permission.middleware";

const router = Router();

router.get("/logs", requireAuth(["CLIENT"]), requireActiveClient, requireClientPermission("canViewLogs"), asyncHandler(clientLogsController.list));

export default router;

import { Router } from "express";
import { asyncHandler } from "../../../shared/http/asyncHandler";
import { requireAuth } from "../../../shared/middleware/auth.middleware";
import { clientLogsController } from "./client.logs.controller";

const router = Router();

router.get("/logs", requireAuth(["CLIENT"]), asyncHandler(clientLogsController.list));

export default router;

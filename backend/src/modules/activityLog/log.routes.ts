import { Router } from "express";
import { listLogs } from "./log.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, requireRole("SUPERADMIN"), listLogs);

export default router;

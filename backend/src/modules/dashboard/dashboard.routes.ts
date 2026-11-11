import { Router } from "express";
import { getDashboardSummary } from "./dashboard.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/summary", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), getDashboardSummary);

export default router;

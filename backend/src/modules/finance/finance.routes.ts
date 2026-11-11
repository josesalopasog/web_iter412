import { Router } from "express";
import { getFinanceSummary } from "./finance.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/summary", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), getFinanceSummary);

export default router;

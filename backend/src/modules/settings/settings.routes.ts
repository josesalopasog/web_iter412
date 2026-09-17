import { Router } from "express";
import { getSettingsHandler, getPublicSettingsHandler, updateSettingsHandler } from "./settings.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", getPublicSettingsHandler);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), getSettingsHandler);
router.patch("/", requireAuth, requireRole("SUPERADMIN", "TREASURER"), updateSettingsHandler);

export default router;

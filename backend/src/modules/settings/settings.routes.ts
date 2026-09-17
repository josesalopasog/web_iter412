import { Router } from "express";
import {
  getSettingsHandler,
  getPublicSettingsHandler,
  updateSettingsHandler,
  updateMerchSettingsHandler,
} from "./settings.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", getPublicSettingsHandler);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), getSettingsHandler);
router.patch("/", requireAuth, requireRole("SUPERADMIN", "TREASURER"), updateSettingsHandler);
router.patch(
  "/merch-prices",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN", "TREASURER"),
  updateMerchSettingsHandler
);

export default router;

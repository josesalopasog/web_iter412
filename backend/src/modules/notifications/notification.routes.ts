import { Router } from "express";
import { listNotifications, createNotification, deleteNotification } from "./notification.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, listNotifications);
router.post("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), createNotification);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), deleteNotification);

export default router;

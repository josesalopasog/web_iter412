import { Router } from "express";
import { listPublicEvents, listEvents, createEvent, updateEvent, deleteEvent } from "./event.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/public", listPublicEvents);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), listEvents);
router.post("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), createEvent);
router.patch("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), updateEvent);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), deleteEvent);

export default router;

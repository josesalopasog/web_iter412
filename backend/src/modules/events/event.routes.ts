import { Router } from "express";
import { listPublicEvents, listEvents, createEvent, updateEvent, deleteEvent } from "./event.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { getRatingsSummary, listMyRatings, rateEvent } from "./rating.controller.js";

const router = Router();

router.get("/public", listPublicEvents);

// Calificaciones de reuniones (antes de las rutas con :id)
router.get("/ratings/mine", requireAuth, listMyRatings);
router.get("/ratings/summary", requireAuth, requireRole("ADMIN", "SUPERADMIN"), getRatingsSummary);
router.put("/:id/rating", requireAuth, rateEvent);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), listEvents);
router.post("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), createEvent);
router.patch("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), updateEvent);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), deleteEvent);

export default router;

import { Router } from "express";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import { finishRetreat, getArchive, listArchives } from "./retreat.controller.js";

const router = Router();

// Finalizar borra participantes y deja inactivos a todos: solo SUPERADMIN.
router.post("/finish", requireAuth, requireRole("SUPERADMIN"), finishRetreat);
router.get("/archives", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), listArchives);
router.get("/archives/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), getArchive);

export default router;

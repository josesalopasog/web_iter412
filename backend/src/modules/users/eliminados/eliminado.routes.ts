import { Router } from "express";
import { listEliminados, restoreEliminado } from "./eliminado.controller.js";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.get("/", requireAuth, requireRole("SUPERADMIN"), listEliminados);
router.post("/:id/restore", requireAuth, requireRole("SUPERADMIN"), restoreEliminado);

export default router;

import { Router } from "express";
import { createSoldadoFromForm, listSoldados, updateSoldado, deleteSoldado } from "./soldado.controller.js";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createSoldadoFromForm);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), listSoldados);
router.patch("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), updateSoldado);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), deleteSoldado);

export default router;

import { Router } from "express";
import {
  createServidorFromForm,
  listServidores,
  getMyServidorProfile,
  updateServidor,
  updateMyServidor,
  changeMyPassword,
  updateServidorRole,
  deleteServidor,
} from "./servidor.controller.js";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createServidorFromForm);
router.get("/me", requireAuth, getMyServidorProfile);
router.patch("/me", requireAuth, updateMyServidor);
router.patch("/me/password", requireAuth, changeMyPassword);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), listServidores);
router.patch("/:id/role", requireAuth, requireRole("SUPERADMIN"), updateServidorRole);
router.patch("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), updateServidor);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN"), deleteServidor);

export default router;

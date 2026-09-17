import { Router } from "express";
import {
  createServidorFromForm,
  listServidores,
  getMyServidorProfile,
  updateServidor,
  updateMyServidor,
  changeMyPassword,
  updateServidorRole,
  resetServidorMerch,
  deleteServidor,
} from "./servidor.controller.js";
import { requireAuth, requireRole } from "../../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createServidorFromForm);
router.get("/me", requireAuth, getMyServidorProfile);
router.patch("/me", requireAuth, updateMyServidor);
router.patch("/me/password", requireAuth, changeMyPassword);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), listServidores);
router.patch("/:id/role", requireAuth, requireRole("SUPERADMIN"), updateServidorRole);
router.patch("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), updateServidor);
router.patch(
  "/:id/reset-merch",
  requireAuth,
  requireRole("ADMIN", "SUPERADMIN", "TREASURER"),
  resetServidorMerch
);
router.delete("/:id", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), deleteServidor);

export default router;

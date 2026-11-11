import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createVoice, listMyVoice, listVoice, updateVoiceStatus } from "./voice.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// Evita envíos repetidos por error (doble clic) o abuso: 20 mensajes por hora por IP.
const voiceRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Has enviado muchos mensajes seguidos. Intenta de nuevo más tarde." },
});

router.post("/", requireAuth, voiceRateLimiter, createVoice);
router.get("/mine", requireAuth, listMyVoice);
router.get("/", requireAuth, requireRole("ADMIN", "SUPERADMIN"), listVoice);
router.patch("/:id/status", requireAuth, requireRole("ADMIN", "SUPERADMIN"), updateVoiceStatus);

export default router;

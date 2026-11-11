import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getAnalyticsSummary, trackPageView } from "./analytics.controller.js";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";

const router = Router();

// Una visita por página abierta: 60 por minuto por IP es de sobra para una persona navegando.
const trackRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes." },
});

router.post("/track", trackRateLimiter, trackPageView);
router.get("/summary", requireAuth, requireRole("ADMIN", "SUPERADMIN", "TREASURER"), getAnalyticsSummary);

export default router;

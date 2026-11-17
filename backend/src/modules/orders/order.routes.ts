import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "../../middlewares/auth.middleware.js";
import {
  bulkUpdateOrderStatus,
  cancelMyOrder,
  createMyOrder,
  createOrder,
  deleteOrder,
  getOrder,
  listMyOrders,
  listOrders,
  updateMyOrder,
  updateOrder,
  updateOrderPayment,
  updateOrderStatus,
} from "./order.controller.js";

const router = Router();
const ADMINS = ["ADMIN", "SUPERADMIN", "TREASURER"] as const;

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Creaste muchas órdenes seguidas. Intenta más tarde." },
});

// Perfil: cada servidor administra sus propias órdenes.
router.get("/mine", requireAuth, listMyOrders);
router.post("/mine", requireAuth, createLimiter, createMyOrder);
router.patch("/mine/:id", requireAuth, updateMyOrder);
router.post("/mine/:id/cancel", requireAuth, cancelMyOrder);

// Dashboard
router.get("/", requireAuth, requireRole(...ADMINS), listOrders);
router.post("/", requireAuth, requireRole(...ADMINS), createOrder);
router.post("/bulk-status", requireAuth, requireRole(...ADMINS), bulkUpdateOrderStatus);
router.get("/:id", requireAuth, requireRole(...ADMINS), getOrder);
router.patch("/:id", requireAuth, requireRole(...ADMINS), updateOrder);
router.patch("/:id/status", requireAuth, requireRole(...ADMINS), updateOrderStatus);
router.patch("/:id/payment", requireAuth, requireRole(...ADMINS), updateOrderPayment);
router.delete("/:id", requireAuth, requireRole("SUPERADMIN"), deleteOrder);

export default router;

import { Router } from "express";
import { login, logout, logoutAll, refresh } from "./auth.controller.js";
import {
  loginAccountRateLimiter,
  loginRateLimiter,
  refreshRateLimiter,
} from "../../middlewares/rateLimit.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", loginRateLimiter, loginAccountRateLimiter, login);
router.post("/refresh", refreshRateLimiter, refresh);
router.post("/logout", logout);
router.post("/logout-all", requireAuth, logoutAll);

export default router;

import { Router } from "express";
import { login } from "./auth.controller.js";
import { loginRateLimiter } from "../../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/login", loginRateLimiter, login);

export default router;

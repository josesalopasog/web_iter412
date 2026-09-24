import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import usersRouter from "./modules/users/index.js";
import authRouter from "./modules/auth/auth.routes.js";
import logsRouter from "./modules/activityLog/log.routes.js";
import settingsRouter from "./modules/settings/settings.routes.js";
import { ApiError } from "./utils/errors.js";
import { env } from "./config/env.js";

export const createApp = () => {
  const app = express();

  // Detrás de un proxy, sin esto req.ip es la IP del proxy y todos los usuarios comparten el rate limit.
  app.set("trust proxy", env.TRUST_PROXY_HOPS);

  app.use(helmet());

  const allowedOrigins = new Set([
    "https://iter412.com",
    "https://www.iter412.com",
    "http://localhost:5173",
    env.FRONTEND_ORIGIN,
    ...env.CORS_ORIGIN.split(",").map((o) => o.trim()),
  ]);

  app.use(
    cors({
      // Origen no permitido: sin cabeceras CORS (el navegador lo bloquea) en lugar de un 500.
      origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)),
      // Necesario para que el navegador envíe/reciba la cookie httpOnly de refresh.
      credentials: true,
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/users", usersRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/logs", logsRouter);
  app.use("/api/settings", settingsRouter);

  app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err instanceof ApiError ? err.statusCode : 500;
    const message = err instanceof Error ? err.message : "Server error";
    res.status(statusCode).json({ message });
  });

  return app;
};
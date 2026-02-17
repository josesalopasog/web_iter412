import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./modules/users/user.routes.js";

import { env } from "./config/env.js";
;

export const createApp = () => {
  const app = express();

  const allowedOrigins = [
    "https://iter412.com",
    "https://www.iter412.com",
    "http://localhost:5173",
  ];

  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // Postman / server-to-server
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: false,
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/users", userRoutes);

  app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

  app.use((err: any, _req: any, res: any, _next: any) => {
    const status = err?.statusCode || 500;
    res.status(status).json({
      message: err?.message || "Server error",
    });
  });

  return app;
};
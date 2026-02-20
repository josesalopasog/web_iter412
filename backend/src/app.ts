import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import usersRouter from "./modules/users/index.js";

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
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: false,
    })
  );

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/users", usersRouter);

  app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = err instanceof Error ? err.message : "Server error";
    res.status(500).json({ message });
  });

  return app;
};
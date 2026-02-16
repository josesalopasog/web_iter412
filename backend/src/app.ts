import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoutes from "./modules/users/user.routes.js";

import { env } from "./config/env.js";
;

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser()); 

   app.use("/api/users", userRoutes);


  return app;
};
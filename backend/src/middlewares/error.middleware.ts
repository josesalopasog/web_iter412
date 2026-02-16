import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors.js";

export const notFound = (req: Request, res: Response) => {
  res.status(404).json({ message: `Not found: ${req.originalUrl}` });
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err instanceof ApiError ? err.statusCode : 500;
  const message = err?.message ?? "Server error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({ message });
};

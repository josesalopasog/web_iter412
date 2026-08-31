import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors.js";
import { verifyToken } from "../modules/auth/auth.utils.js";
import type { UserRole } from "../modules/users/roles.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) return next(new ApiError(401, "No autenticado"));

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new ApiError(401, "Sesión inválida o expirada"));
  }
};

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "No autenticado"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "No autorizado"));
    next();
  };

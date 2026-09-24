import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/errors.js";
import { toAuthUser, verifyToken } from "../modules/auth/auth.utils.js";
import type { UserRole } from "../modules/users/roles.js";
import { Servidor } from "../modules/users/servidores/servidor.model.js";

export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) return next(new ApiError(401, "No autenticado"));

  let decoded;
  try {
    decoded = verifyToken(token, "access");
  } catch {
    return next(new ApiError(401, "Sesión inválida o expirada"));
  }

  try {
    const servidor = await Servidor.findById(decoded.sub).select(
      "email role firstNames lastNames preferredName tokenVersion"
    );
    // tokenVersion distinto = la sesión fue revocada (cambio de contraseña o cierre global).
    if (!servidor || (servidor.tokenVersion ?? 0) !== decoded.tv) {
      return next(new ApiError(401, "Sesión inválida o expirada"));
    }

    req.user = toAuthUser(servidor);
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new ApiError(401, "No autenticado"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "No autorizado"));
    next();
  };

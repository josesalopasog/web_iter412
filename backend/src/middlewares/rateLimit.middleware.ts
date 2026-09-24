import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request } from "express";

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const ipKey = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

// Solo cuentan los intentos fallidos: así muchos usuarios legítimos detrás de una misma IP
// (VPN, red del colegio/iglesia, datos móviles compartidos) no se bloquean entre sí.
export const loginRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos." },
});

// Límite por cuenta: frena la adivinanza de una contraseña aunque el atacante rote de IP.
export const loginAccountRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    return email ? `email:${email}` : ipKey(req);
  },
  message: { message: "Demasiados intentos de inicio de sesión. Intenta de nuevo en unos minutos." },
});

export const refreshRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas solicitudes. Intenta de nuevo en unos minutos." },
});

// Debe ir después de requireAuth: limita por usuario, no por IP.
export const changePasswordRateLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user ? `user:${req.user.sub}` : ipKey(req)),
  message: { message: "Demasiados intentos de cambio de contraseña. Intenta de nuevo en unos minutos." },
});

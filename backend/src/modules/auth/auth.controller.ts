import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { createLog } from "../activityLog/createLog.js";
import {
  REFRESH_COOKIE,
  clearRefreshCookie,
  issueSession,
  toAuthUser,
  verifyToken,
} from "./auth.utils.js";

// Hash falso para gastar el mismo tiempo de bcrypt cuando el email no existe
// y así no revelar por latencia qué cuentas están registradas.
const DUMMY_HASH = bcrypt.hashSync("iter412-dummy-password", 10);

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: unknown; password?: unknown };

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    throw new ApiError(400, "Email y contraseña son obligatorios");
  }

  const servidor = await Servidor.findOne({ email: email.trim().toLowerCase() });
  const passwordOk = await bcrypt.compare(password, servidor?.passwordHash ?? DUMMY_HASH);
  if (!servidor || !passwordOk) throw new ApiError(401, "Credenciales inválidas");

  const token = issueSession(res, String(servidor._id), servidor.tokenVersion ?? 0);

  res.json({ token, user: toAuthUser(servidor) });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!refreshToken) throw new ApiError(401, "No autenticado");

  let payload;
  try {
    payload = verifyToken(refreshToken, "refresh");
  } catch {
    clearRefreshCookie(res);
    throw new ApiError(401, "Sesión inválida o expirada");
  }

  const servidor = await Servidor.findById(payload.sub);
  if (!servidor || (servidor.tokenVersion ?? 0) !== payload.tv) {
    clearRefreshCookie(res);
    throw new ApiError(401, "Sesión inválida o expirada");
  }

  // Rota la cookie de refresh y devuelve un access token nuevo.
  const token = issueSession(res, String(servidor._id), servidor.tokenVersion ?? 0);

  res.json({ token, user: toAuthUser(servidor) });
});

export const logout = asyncHandler(async (_req, res) => {
  clearRefreshCookie(res);
  res.json({ ok: true });
});

export const logoutAll = asyncHandler(async (req, res) => {
  const servidor = await Servidor.findById(req.user!.sub);
  if (!servidor) throw new ApiError(404, "No encontrado");

  servidor.tokenVersion = (servidor.tokenVersion ?? 0) + 1;
  await servidor.save();

  clearRefreshCookie(res);
  await createLog(req.user!, "CERRAR_TODAS_LAS_SESIONES", "Cerró sesión en todos sus dispositivos");

  res.json({ ok: true });
});

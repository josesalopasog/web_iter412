import jwt from "jsonwebtoken";
import type { CookieOptions, Response } from "express";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../types/express.js";

type TokenType = "access" | "refresh";

export type TokenPayload = {
  sub: string;
  // tokenVersion del usuario al emitir el token: si cambia, el token queda revocado.
  tv: number;
  typ: TokenType;
};

export const REFRESH_COOKIE = "iter412_rt";
const REFRESH_COOKIE_PATH = "/api/auth";
const DAY_MS = 24 * 60 * 60 * 1000;

const sign = (sub: string, tv: number, typ: TokenType, expiresIn: jwt.SignOptions["expiresIn"]) =>
  jwt.sign({ sub, tv, typ } satisfies TokenPayload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn,
  });

export const signAccessToken = (sub: string, tv: number): string =>
  sign(sub, tv, "access", env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]);

export const signRefreshToken = (sub: string, tv: number): string =>
  sign(sub, tv, "refresh", `${env.REFRESH_TOKEN_DAYS}d`);

export const verifyToken = (token: string, expected: TokenType): TokenPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET, { algorithms: ["HS256"] }) as Partial<TokenPayload>;
  if (decoded.typ !== expected || typeof decoded.sub !== "string" || typeof decoded.tv !== "number") {
    throw new Error("Invalid token");
  }
  return decoded as TokenPayload;
};

const refreshCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  // api.iter412.com e iter412.com son "same-site", así que Lax basta y no cuenta como cookie de terceros.
  sameSite: "lax",
  path: REFRESH_COOKIE_PATH,
});

export const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    ...refreshCookieOptions(),
    maxAge: env.REFRESH_TOKEN_DAYS * DAY_MS,
  });
};

export const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, refreshCookieOptions());
};

/** Emite un access token nuevo y rota la cookie de refresh. */
export const issueSession = (res: Response, sub: string, tokenVersion: number): string => {
  setRefreshCookie(res, signRefreshToken(sub, tokenVersion));
  return signAccessToken(sub, tokenVersion);
};

export const toAuthUser = (servidor: {
  _id: unknown;
  email: string;
  role: AuthUser["role"];
  firstNames: string;
  lastNames: string;
  preferredName: string;
}): AuthUser => ({
  sub: String(servidor._id),
  email: servidor.email,
  role: servidor.role,
  firstNames: servidor.firstNames,
  lastNames: servidor.lastNames,
  preferredName: servidor.preferredName,
});

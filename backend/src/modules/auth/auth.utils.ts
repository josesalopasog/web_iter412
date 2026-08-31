import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import type { AuthUser } from "../../types/express.js";

export const signToken = (payload: AuthUser): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });

export const verifyToken = (token: string): AuthUser =>
  jwt.verify(token, env.JWT_SECRET) as AuthUser;

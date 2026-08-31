import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { signToken } from "./auth.utils.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    throw new ApiError(400, "Email y contraseña son obligatorios");
  }

  const servidor = await Servidor.findOne({ email: String(email).toLowerCase() });
  if (!servidor) throw new ApiError(401, "Credenciales inválidas");

  const passwordOk = await bcrypt.compare(password, servidor.passwordHash);
  if (!passwordOk) throw new ApiError(401, "Credenciales inválidas");

  const user = {
    sub: String(servidor._id),
    email: servidor.email,
    role: servidor.role,
    firstNames: servidor.firstNames,
    lastNames: servidor.lastNames,
    preferredName: servidor.preferredName,
  };

  const token = signToken(user);

  res.json({ token, user });
});

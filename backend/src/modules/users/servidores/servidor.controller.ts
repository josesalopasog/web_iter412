import bcrypt from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/errors.js";
import { sendRegistrationConfirmationEmail } from "../../../services/mailer.service.js";
import { softDelete } from "../softDelete.js";
import { Servidor } from "./servidor.model.js";
import type { RegistrationServidoresDTO } from "./servidor.types.js"

const formatRegistrationNumber = (n: number) => String(n).padStart(3, "0");

const EDITABLE_FIELDS = new Set([
  "gender",
  "email",
  "password",
  "firstNames",
  "lastNames",
  "preferredName",
  "referralNamePhone",
  "documentType",
  "documentTypeOther",
  "documentNumber",
  "city",
  "address",
  "birthDate",
  "age",
  "phone",
  "eps",
  "bloodType",
  "needsShirt",
  "shirtColors",
  "shirtSize",
  "shirtSizeOther",
  "merchItems",
  "merchSize",
  "merchSizeOther",
  "emergencyFirstName",
  "emergencyLastName",
  "emergencyDocumentType",
  "emergencyDocumentTypeOther",
  "emergencyDocumentNumber",
  "emergencyPhone",
  "emergencyRelation",
  "emergencyEmail",
  "emergencyAddress",
  "services",
  "lastService",
  "serviceLeaderOf",
  "wentToOtherSedes",
  "otherSedesDetail",
  "formationOther",
]);

const RESTRICTED_FIELDS = new Set(["email", "password"]);

const ASSIGNABLE_ROLES = new Set(["SERVIDOR", "ADMIN", "SUPERADMIN"]);

const requireFields = (body: any, fields: string[]) => {
  const missing = fields.filter(
    (f) => body[f] === undefined || body[f] === null || body[f] === ""
  );
  if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
};

const requireIf = (cond: boolean, body: any, fields: string[]) => {
  if (!cond) return;
  requireFields(body, fields);
};

export const createServidorFromForm = asyncHandler(async (req, res) => {
  const body = req.body as Partial<RegistrationServidoresDTO>;

  requireFields(body, [
    "gender",
    "email",
    "password",
    "firstNames",
    "lastNames",
    "preferredName",
    "referralNamePhone",

    "documentType",
    "documentNumber",

    "city",
    "address",
    "birthDate",
    "age",
    "phone",

    "eps",
    "bloodType",

    "needsShirt",
    "shirtColors",
    "shirtSize",

    "merchItems",

    "emergencyFirstName",
    "emergencyLastName",
    "emergencyDocumentType",
    "emergencyDocumentNumber",
    "emergencyPhone",
    "emergencyRelation",
    "emergencyEmail",
    "emergencyAddress",

    "services",
    "lastService",
    "serviceLeaderOf",

    "wentToOtherSedes",
    "formationOther",

    "acceptTerms",
    "acceptDataPolicy",
  ]);

  if (typeof body.acceptTerms !== "boolean") throw new ApiError(400, "acceptTerms must be boolean");
  if (typeof body.acceptDataPolicy !== "boolean") throw new ApiError(400, "acceptDataPolicy must be boolean");

  if (!Array.isArray(body.services) || body.services.length === 0) {
    throw new ApiError(400, "services must be a non-empty array");
  }
  if (!Array.isArray(body.merchItems)) {
    throw new ApiError(400, "merchItems must be an array");
  }
  if (body.needsShirt === "SI") {
    if (!Array.isArray(body.shirtColors) || body.shirtColors.length === 0) {
      throw new ApiError(400, "shirtColors is required when needsShirt=SI");
    }
  } else {
    body.shirtColors = [];
  }

  const merchNeedsSize = Array.isArray(body.merchItems) && body.merchItems.some((i) => i !== "NINGUNA");

  requireIf(body.documentType === "OTRO", body, ["documentTypeOther"]);
  requireIf(body.emergencyDocumentType === "OTRO", body, ["emergencyDocumentTypeOther"]);
  requireIf(body.shirtSize === "OTRO", body, ["shirtSizeOther"]);
  requireIf(merchNeedsSize, body, ["merchSize"]);
  requireIf(body.merchSize === "OTRO", body, ["merchSizeOther"]);
  requireIf(body.wentToOtherSedes === "SI", body, ["otherSedesDetail"]);

  if (typeof body.password !== "string" || body.password.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters");
  }

  const existing = await Servidor.findOne({ email: String(body.email).toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(body.password, 10);

  const registrationNumber = (await Servidor.countDocuments()) + 1;

  const servidor = await Servidor.create({
    registrationNumber,
    role: "SERVIDOR",
    gender: body.gender,

    email: String(body.email).toLowerCase(),
    passwordHash,

    firstNames: body.firstNames,
    lastNames: body.lastNames,
    preferredName: body.preferredName,
    referralNamePhone: body.referralNamePhone,

    documentType: body.documentType,
    documentTypeOther: body.documentType === "OTRO" ? body.documentTypeOther : "",
    documentNumber: body.documentNumber,

    city: body.city,
    address: body.address,
    birthDate: body.birthDate,
    age: Number(body.age),
    phone: body.phone,

    eps: body.eps,
    bloodType: body.bloodType,

    needsShirt: body.needsShirt,
    shirtColors: body.needsShirt === "SI" ? body.shirtColors : [],
    shirtSize: body.shirtSize,
    shirtSizeOther: body.shirtSize === "OTRO" ? body.shirtSizeOther : "",

    merchItems: body.merchItems ?? [],
    merchSize: body.merchSize ?? "",
    merchSizeOther: body.merchSize === "OTRO" ? body.merchSizeOther : "",

    emergencyFirstName: body.emergencyFirstName,
    emergencyLastName: body.emergencyLastName,
    emergencyDocumentType: body.emergencyDocumentType,
    emergencyDocumentTypeOther: body.emergencyDocumentType === "OTRO" ? body.emergencyDocumentTypeOther : "",
    emergencyDocumentNumber: body.emergencyDocumentNumber,
    emergencyPhone: body.emergencyPhone,
    emergencyRelation: body.emergencyRelation,
    emergencyEmail: String(body.emergencyEmail).toLowerCase(),
    emergencyAddress: body.emergencyAddress,

    services: body.services,
    lastService: body.lastService,
    serviceLeaderOf: body.serviceLeaderOf,

    wentToOtherSedes: body.wentToOtherSedes,
    otherSedesDetail: body.wentToOtherSedes === "SI" ? body.otherSedesDetail : "",

    formationOther: body.formationOther,

    acceptTerms: body.acceptTerms,
    acceptDataPolicy: body.acceptDataPolicy,
  });

  void sendRegistrationConfirmationEmail(servidor.email, servidor.preferredName, "SERVIDOR");

  res.status(201).json({
    id: servidor._id,
    registrationNumber: formatRegistrationNumber(registrationNumber),
    email: servidor.email,
    createdAt: servidor.createdAt,
  });
});

export const listServidores = asyncHandler(async (_req, res) => {
  const servidores = await Servidor.find().select("-passwordHash").sort({ createdAt: 1 });
  res.json(servidores);
});

export const getMyServidorProfile = asyncHandler(async (req, res) => {
  const servidor = await Servidor.findById(req.user!.sub).select("-passwordHash");
  if (!servidor) throw new ApiError(404, "No encontrado");
  res.json(servidor);
});

const isValidServicesValue = (value: unknown): value is string[] =>
  Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v);

const isValidStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === "string");

const ARRAY_FIELDS = new Set(["shirtColors", "merchItems"]);

export const updateServidor = asyncHandler(async (req, res) => {
  const { field, value } = req.body as { field?: string; value?: unknown };

  if (!field || !EDITABLE_FIELDS.has(field)) {
    throw new ApiError(400, "Campo no editable");
  }
  if (RESTRICTED_FIELDS.has(field) && req.user!.role !== "SUPERADMIN") {
    throw new ApiError(403, "Solo un SUPERADMIN puede editar este campo");
  }

  const servidor = await Servidor.findById(req.params.id);
  if (!servidor) throw new ApiError(404, "No encontrado");

  if (field === "password") {
    if (typeof value !== "string" || value.length < 8) {
      throw new ApiError(400, "La contraseña debe tener al menos 8 caracteres");
    }
    servidor.passwordHash = await bcrypt.hash(value, 10);
  } else if (field === "email") {
    servidor.email = String(value).toLowerCase();
  } else if (field === "services") {
    if (!isValidServicesValue(value)) throw new ApiError(400, "Selecciona al menos un servicio");
    servidor.services = value;
  } else if (ARRAY_FIELDS.has(field)) {
    if (!isValidStringArray(value)) throw new ApiError(400, "Selección inválida");
    (servidor as any)[field] = value;
  } else {
    (servidor as any)[field] = value;
  }

  await servidor.save();

  const result = servidor.toObject();
  delete (result as any).passwordHash;
  res.json(result);
});

export const updateMyServidor = asyncHandler(async (req, res) => {
  const { field, value } = req.body as { field?: string; value?: unknown };

  if (!field || field === "password" || !EDITABLE_FIELDS.has(field)) {
    throw new ApiError(400, "Campo no editable");
  }
  if (RESTRICTED_FIELDS.has(field) && req.user!.role !== "SUPERADMIN") {
    throw new ApiError(403, "Solo un SUPERADMIN puede editar este campo");
  }

  const servidor = await Servidor.findById(req.user!.sub);
  if (!servidor) throw new ApiError(404, "No encontrado");

  if (field === "services") {
    if (!isValidServicesValue(value)) throw new ApiError(400, "Selecciona al menos un servicio");
    servidor.services = value;
  } else if (ARRAY_FIELDS.has(field)) {
    if (!isValidStringArray(value)) throw new ApiError(400, "Selección inválida");
    (servidor as any)[field] = value;
  } else {
    (servidor as any)[field] = field === "email" ? String(value).toLowerCase() : value;
  }

  await servidor.save();

  const result = servidor.toObject();
  delete (result as any).passwordHash;
  res.json(result);
});

export const changeMyPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body as { oldPassword?: string; newPassword?: string };

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "La contraseña actual y la nueva son obligatorias");
  }
  if (newPassword.length < 8) {
    throw new ApiError(400, "La nueva contraseña debe tener al menos 8 caracteres");
  }

  const servidor = await Servidor.findById(req.user!.sub);
  if (!servidor) throw new ApiError(404, "No encontrado");

  const isValid = await bcrypt.compare(oldPassword, servidor.passwordHash);
  if (!isValid) throw new ApiError(401, "La contraseña actual no es correcta");

  servidor.passwordHash = await bcrypt.hash(newPassword, 10);
  await servidor.save();

  res.json({ ok: true });
});

export const updateServidorRole = asyncHandler(async (req, res) => {
  const { role } = req.body as { role?: string };

  if (!role || !ASSIGNABLE_ROLES.has(role)) {
    throw new ApiError(400, "Rol inválido");
  }

  const servidor = await Servidor.findById(req.params.id);
  if (!servidor) throw new ApiError(404, "No encontrado");

  servidor.role = role as any;
  await servidor.save();

  const result = servidor.toObject();
  delete (result as any).passwordHash;
  res.json(result);
});

export const deleteServidor = asyncHandler(async (req, res) => {
  const servidor = await Servidor.findById(req.params.id);
  if (!servidor) throw new ApiError(404, "No encontrado");

  await softDelete(servidor, "servidores", req.user!);
  await servidor.deleteOne();

  res.json({ ok: true });
});
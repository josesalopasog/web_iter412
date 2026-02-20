import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { Servidor } from "./servidor.model.js";
import type { RegistrationServidorDTO } from "./servidores.types.js";

const requireFields = (body: any, fields: string[]) => {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
};

const requireIf = (cond: boolean, body: any, fields: string[]) => {
  if (!cond) return;
  requireFields(body, fields);
};

export const createServidorFromForm = asyncHandler(async (req, res) => {
  const body = req.body as Partial<RegistrationServidorDTO>;

  requireFields(body, [
    "email",
    "fullName",
    "preferredName",
    "referralNamePhone",
    "documentType",
    "documentNumber",
    "city",
    "birthDate",
    "age",
    "phone",
    "eps",
    "bloodType",
    "needsShirt",
    "shirtSize",
    "merchItems",
    "merchSize",
    "emergency1Name",
    "emergency1Phone",
    "emergency1Relation",
    "emergency2Name",
    "emergency2Phone",
    "emergency2Relation",
    "services",
    "lastService",
    "serviceLeaderOf",
    "wentToOtherSedes",
    "formationOther",
    "acceptTerms",
    "acceptDataPolicy",
    "password",
  ]);

  requireIf(body.documentType === "OTRO", body, ["documentTypeOther"]);
  requireIf(body.shirtSize === "OTRO", body, ["shirtSizeOther"]);
  requireIf(body.merchSize === "OTRO", body, ["merchSizeOther"]);
  requireIf(body.wentToOtherSedes === "SI", body, ["otherSedesDetail"]);

  if (body.needsShirt === "NO") {
    body.shirtColor = "";
    body.shirtSize = body.shirtSize || "S";
  } else {
    requireFields(body, ["shirtColor"]);
  }

  const pwd = String(body.password ?? "");
  if (pwd.length < 8) throw new ApiError(400, "Password must be at least 8 characters");

  const email = String(body.email).toLowerCase().trim();

  const existing = await Servidor.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered (servidores)");

  const passwordHash = await bcrypt.hash(pwd, 10);

  const docTypeOther = body.documentType === "OTRO" ? String(body.documentTypeOther ?? "").trim() : "";
  const shirtSizeOther = body.shirtSize === "OTRO" ? String(body.shirtSizeOther ?? "").trim() : "";
  const merchSizeOther = body.merchSize === "OTRO" ? String(body.merchSizeOther ?? "").trim() : "";
  const otherSedesDetail = body.wentToOtherSedes === "SI" ? String(body.otherSedesDetail ?? "").trim() : "";

  const servidor = await Servidor.create({
    role: "SERVIDOR",
    email,
    passwordHash,

    fullName: String(body.fullName).trim(),
    preferredName: String(body.preferredName).trim(),
    referralNamePhone: String(body.referralNamePhone).trim(),

    documentType: body.documentType,
    documentTypeOther: docTypeOther,
    documentNumber: String(body.documentNumber).trim(),

    city: String(body.city).trim(),
    birthDate: String(body.birthDate).trim(),
    age: Number(body.age),
    phone: String(body.phone).trim(),

    eps: String(body.eps).trim(),
    bloodType: String(body.bloodType).trim(),

    needsShirt: body.needsShirt,
    shirtColor: String(body.shirtColor ?? ""),
    shirtSize: body.shirtSize,
    shirtSizeOther,

    merchItems: Array.isArray(body.merchItems) ? body.merchItems : [],
    merchSize: body.merchSize,
    merchSizeOther,

    emergency1Name: String(body.emergency1Name).trim(),
    emergency1Phone: String(body.emergency1Phone).trim(),
    emergency1Relation: String(body.emergency1Relation).trim(),

    emergency2Name: String(body.emergency2Name).trim(),
    emergency2Phone: String(body.emergency2Phone).trim(),
    emergency2Relation: String(body.emergency2Relation).trim(),

    services: Array.isArray(body.services) ? body.services : [],
    lastService: body.lastService,
    serviceLeaderOf: String(body.serviceLeaderOf).trim(),

    wentToOtherSedes: body.wentToOtherSedes,
    otherSedesDetail,

    formationOther: String(body.formationOther).trim(),

    acceptTerms: body.acceptTerms,
    acceptDataPolicy: body.acceptDataPolicy,
  });

  res.status(201).json({
    id: servidor._id,
    email: servidor.email,
    role: servidor.role,
    createdAt: servidor.createdAt,
  });
});
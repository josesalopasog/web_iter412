import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { Servidor } from "./servidor.model.js";
import type { RegistrationServidoresDTO } from "./servidores.types.js"

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
    "email",
    "password",
    "firstNames",
    "lastNames",
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
    "shirtColors",
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

  requireIf(body.documentType === "OTRO", body, ["documentTypeOther"]);
  requireIf(body.shirtSize === "OTRO", body, ["shirtSizeOther"]);
  requireIf(body.merchSize === "OTRO", body, ["merchSizeOther"]);
  requireIf(body.wentToOtherSedes === "SI", body, ["otherSedesDetail"]);

  if (typeof body.password !== "string" || body.password.length < 8) {
    throw new ApiError(400, "password must be at least 8 characters");
  }

  const existing = await Servidor.findOne({ email: String(body.email).toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(body.password, 10);

  const servidor = await Servidor.create({
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
    merchSize: body.merchSize,
    merchSizeOther: body.merchSize === "OTRO" ? body.merchSizeOther : "",

    emergency1Name: body.emergency1Name,
    emergency1Phone: body.emergency1Phone,
    emergency1Relation: body.emergency1Relation,

    emergency2Name: body.emergency2Name,
    emergency2Phone: body.emergency2Phone,
    emergency2Relation: body.emergency2Relation,

    services: body.services,
    lastService: body.lastService,
    serviceLeaderOf: body.serviceLeaderOf,

    wentToOtherSedes: body.wentToOtherSedes,
    otherSedesDetail: body.wentToOtherSedes === "SI" ? body.otherSedesDetail : "",

    formationOther: body.formationOther,

    acceptTerms: body.acceptTerms,
    acceptDataPolicy: body.acceptDataPolicy,
  });

  res.status(201).json({
    id: servidor._id,
    email: servidor.email,
    createdAt: servidor.createdAt,
  });
});
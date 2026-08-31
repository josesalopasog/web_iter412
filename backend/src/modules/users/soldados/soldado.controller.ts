import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/errors.js";
import { sendRegistrationConfirmationEmail } from "../../../services/mailer.service.js";
import { softDelete } from "../softDelete.js";
import { createLog } from "../../logs/createLog.js";
import { Soldado } from "./soldado.model.js";
import type { RegistrationSoldadosDTO, YesNo } from "./soldado.types.js";

const EDITABLE_FIELDS = new Set([
  "gender",
  "genderOther",
  "email",
  "firstNames",
  "lastNames",
  "preferredName",
  "documentType",
  "documentTypeOther",
  "documentNumber",
  "age",
  "birthDate",
  "address",
  "city",
  "neighborhood",
  "phone",
  "eps",
  "bloodType",
  "practicesReligion",
  "whichReligion",
  "occupation",
  "occupationOther",
  "occupationPlace",
  "shirtSize",
  "shirtSizeOther",
  "isSurprise",
  "emergencyFirstName",
  "emergencyLastName",
  "emergencyDocumentType",
  "emergencyDocumentTypeOther",
  "emergencyDocumentNumber",
  "emergencyPhone",
  "emergencyRelation",
  "emergencyEmail",
  "emergencyAddress",
  "hearAbout",
  "hearAboutOther",
  "invitedByCommunity",
  "invitedByName",
  "registrationNumber",
]);

const RESTRICTED_FIELDS = new Set(["email", "registrationNumber"]);

const isValidRegistrationNumber = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

const formatRegistrationNumber = (n: number | null | undefined) =>
  n == null ? "s/n" : String(n).padStart(3, "0");

const isEmpty = (v: unknown) => {
  if (v === undefined || v === null) return true;
  if (typeof v === "string" && v.trim() === "") return true;
  if (Array.isArray(v) && v.length === 0) return true;
  return false;
};

const requireFields = (body: Record<string, unknown>, fields: string[]) => {
  const missing = fields.filter((f) => isEmpty(body[f]));
  if (missing.length) throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
};

const requireIf = (cond: boolean, body: Record<string, unknown>, fields: string[]) => {
  if (!cond) return;
  requireFields(body, fields);
};

const requireTrue = (body: Record<string, unknown>, fields: string[]) => {
  const missing = fields.filter((f) => body[f] !== true);
  if (missing.length) throw new ApiError(400, `Must accept: ${missing.join(", ")}`);
};

const normalizeYesNo = (v: unknown): YesNo => (v === true || v === "SI" ? "SI" : "NO");

export const createSoldadoFromForm = asyncHandler(async (req, res) => {
  const body = req.body as Partial<RegistrationSoldadosDTO>;

  requireFields(body as any, [
    "gender",
    "firstNames",
    "lastNames",
    "preferredName",
    "email",
    "phone",
    "documentType",
    "documentNumber",
    "age",
    "birthDate",
    "address",
    "city",
    "neighborhood",
    "eps",
    "bloodType",
    "practicesReligion",
    "occupation",
    "occupationPlace",
    "sacraments",
    "restrictions",
    "shirtSize",
    "isSurprise",
    "emergencyFirstName",
    "emergencyLastName",
    "emergencyDocumentType",
    "emergencyDocumentNumber",
    "emergencyPhone",
    "emergencyRelation",
    "emergencyEmail",
    "emergencyAddress",
    "hearAbout",
    "invitedByCommunity",
  ]);

  requireTrue(body as any, ["acceptTerms", "acceptDataPolicy"]);

  requireIf(body.gender === "Otro", body as any, ["genderOther"]);
  requireIf(body.documentType === "OTRO", body as any, ["documentTypeOther"]);
  requireIf(body.emergencyDocumentType === "OTRO", body as any, ["emergencyDocumentTypeOther"]);
  requireIf(body.occupation === "OTRO", body as any, ["occupationOther"]);
  requireIf(Array.isArray(body.restrictions) && body.restrictions.includes("TOMA_MEDICAMENTOS"), body as any, ["medicationsDetail"]);
  requireIf(body.shirtSize === "OTRO", body as any, ["shirtSizeOther"]);
  requireIf(body.hearAbout === "OTRO", body as any, ["hearAboutOther"]);
  requireIf(body.invitedByCommunity === "SI", body as any, ["invitedByName"]);
  requireIf(body.practicesReligion === "SI", body as any, ["whichReligion"]);

  const existing = await Soldado.findOne({ email: body.email?.toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const registrationNumber = (await Soldado.countDocuments()) + 1;

  const soldado = await Soldado.create({
    registrationNumber,

    email: String(body.email).toLowerCase(),
    role: "SOLDADO",

    gender: body.gender,
    genderOther: body.gender === "Otro" ? body.genderOther : "",

    firstNames: body.firstNames,
    lastNames: body.lastNames,
    preferredName: body.preferredName,

    documentType: body.documentType,
    documentTypeOther: body.documentTypeOther,
    documentNumber: body.documentNumber,

    age: Number(body.age),
    birthDate: body.birthDate,

    address: body.address,
    city: body.city,
    neighborhood: body.neighborhood,

    phone: body.phone,

    eps: body.eps,
    bloodType: body.bloodType,

    practicesReligion: normalizeYesNo(body.practicesReligion),
    whichReligion: body.whichReligion,

    occupation: body.occupation,
    occupationOther: body.occupationOther,
    occupationPlace: body.occupationPlace,

    sacraments: body.sacraments,
    restrictions: body.restrictions,
    restrictionsOther: body.restrictionsOther,
    medicationsDetail: body.medicationsDetail,

    shirtSize: body.shirtSize,
    shirtSizeOther: body.shirtSizeOther,

    isSurprise: normalizeYesNo(body.isSurprise),

    emergencyFirstName: body.emergencyFirstName,
    emergencyLastName: body.emergencyLastName,
    emergencyDocumentType: body.emergencyDocumentType,
    emergencyDocumentTypeOther: body.emergencyDocumentTypeOther,
    emergencyDocumentNumber: body.emergencyDocumentNumber,
    emergencyPhone: body.emergencyPhone,
    emergencyRelation: body.emergencyRelation,
    emergencyEmail: String(body.emergencyEmail).toLowerCase(),
    emergencyAddress: body.emergencyAddress,

    hearAbout: body.hearAbout,
    hearAboutOther: body.hearAboutOther,

    invitedByCommunity: normalizeYesNo(body.invitedByCommunity),
    invitedByName: body.invitedByName,

    acceptTerms: Boolean(body.acceptTerms),
    acceptDataPolicy: Boolean(body.acceptDataPolicy),
  });

  void sendRegistrationConfirmationEmail(soldado.email, soldado.preferredName, "SOLDADO");

  res.status(201).json({
    id: soldado._id,
    registrationNumber: formatRegistrationNumber(registrationNumber),
    email: soldado.email,
    role: soldado.role,
    createdAt: soldado.createdAt,
  });
});

export const listSoldados = asyncHandler(async (_req, res) => {
  const soldados = await Soldado.find().sort({ createdAt: 1 });
  res.json(soldados);
});

export const updateSoldado = asyncHandler(async (req, res) => {
  const { field, value } = req.body as { field?: string; value?: unknown };

  if (!field || !EDITABLE_FIELDS.has(field)) {
    throw new ApiError(400, "Campo no editable");
  }
  if (RESTRICTED_FIELDS.has(field) && req.user!.role !== "SUPERADMIN") {
    throw new ApiError(403, "Solo un SUPERADMIN puede editar este campo");
  }

  const soldado = await Soldado.findById(req.params.id);
  if (!soldado) throw new ApiError(404, "No encontrado");

  const oldValue = (soldado as any)[field];

  if (field === "registrationNumber") {
    if (!isValidRegistrationNumber(value)) {
      throw new ApiError(400, "El número de registro debe ser un entero positivo");
    }
    soldado.registrationNumber = Number(value);
  } else {
    (soldado as any)[field] = field === "email" ? String(value).toLowerCase() : value;
  }

  try {
    await soldado.save();
  } catch (error: any) {
    if (error?.code === 11000) {
      throw new ApiError(409, "Ese número de registro ya está en uso");
    }
    throw error;
  }

  await createLog(
    req.user!,
    "EDITAR_SOLDADO",
    `Editó "${field}" de ${soldado.firstNames} ${soldado.lastNames} (SOLDADO): "${oldValue ?? ""}" → "${value ?? ""}"`
  );

  res.json(soldado);
});

export const deleteSoldado = asyncHandler(async (req, res) => {
  const soldado = await Soldado.findById(req.params.id);
  if (!soldado) throw new ApiError(404, "No encontrado");

  await softDelete(soldado, "soldados", req.user!);
  await soldado.deleteOne();

  await createLog(
    req.user!,
    "ELIMINAR_SOLDADO",
    `Eliminó a ${soldado.firstNames} ${soldado.lastNames} (SOLDADO) - N° registro ${formatRegistrationNumber(soldado.registrationNumber)}`
  );

  res.json({ ok: true });
});
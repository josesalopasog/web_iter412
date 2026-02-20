import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/errors.js";
import { Soldado } from "./soldado.model.js";
import type { RegistrationSoldadosDTO, YesNo } from "./soldado.types.js";

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
    "emergencyName",
    "emergencyPhone",
    "emergencyRelation",
    "emergencyEmail",
    "hearAbout",
    "invitedByCommunity",
  ]);

  requireTrue(body as any, ["acceptTerms", "acceptDataPolicy"]);

  requireIf(body.documentType === "OTRO", body as any, ["documentTypeOther"]);
  requireIf(body.occupation === "OTRO", body as any, ["occupationOther"]);
  requireIf(Array.isArray(body.restrictions) && body.restrictions.includes("TOMA_MEDICAMENTOS"), body as any, ["medicationsDetail"]);
  requireIf(body.shirtSize === "OTRO", body as any, ["shirtSizeOther"]);
  requireIf(body.hearAbout === "OTRO", body as any, ["hearAboutOther"]);
  requireIf(body.invitedByCommunity === "SI", body as any, ["invitedByName"]);
  requireIf(body.practicesReligion === "SI", body as any, ["whichReligion"]);

  const existing = await Soldado.findOne({ email: body.email?.toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const soldado = await Soldado.create({
    email: String(body.email).toLowerCase(),
    role: "SOLDADO",

    gender: body.gender,

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

    emergencyName: body.emergencyName,
    emergencyPhone: body.emergencyPhone,
    emergencyRelation: body.emergencyRelation,
    emergencyEmail: String(body.emergencyEmail).toLowerCase(),

    hearAbout: body.hearAbout,
    hearAboutOther: body.hearAboutOther,

    invitedByCommunity: normalizeYesNo(body.invitedByCommunity),
    invitedByName: body.invitedByName,

    acceptTerms: Boolean(body.acceptTerms),
    acceptDataPolicy: Boolean(body.acceptDataPolicy),
  });

  res.status(201).json({
    id: soldado._id,
    email: soldado.email,
    role: soldado.role,
    createdAt: soldado.createdAt,
  });
});
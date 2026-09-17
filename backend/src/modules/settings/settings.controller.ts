import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import { getSettings } from "./settings.service.js";
import type { SettingsDoc } from "./settings.service.js";

type SettingsField =
  | "soldadoPrice"
  | "servidorPrice"
  | "fridayDate"
  | "saturdayDate"
  | "sundayDate"
  | "retreatMonth"
  | "retreatYear"
  | "advanceStartDay"
  | "advanceEndDay"
  | "advanceMonth"
  | "finalPaymentStartDay"
  | "finalPaymentEndDay"
  | "finalPaymentMonth"
  | "subsidyCap";

const FIELD_LABELS: Record<SettingsField, string> = {
  soldadoPrice: "precio de retiro soldados",
  servidorPrice: "precio de retiro servidores",
  fridayDate: "fecha viernes",
  saturdayDate: "fecha sábado",
  sundayDate: "fecha domingo",
  retreatMonth: "mes del retiro",
  retreatYear: "año del retiro",
  advanceStartDay: "inicio plazo de abono",
  advanceEndDay: "fin plazo de abono",
  advanceMonth: "mes del plazo de abono",
  finalPaymentStartDay: "inicio plazo de pago total",
  finalPaymentEndDay: "fin plazo de pago total",
  finalPaymentMonth: "mes del plazo de pago total",
  subsidyCap: "subsidio disponible",
};

const isValidPrice = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
};

const isValidDayOfMonth = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 31;
};

const isValidMonth = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 12;
};

const isValidYear = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 2000 && num <= 2100;
};

const isValidCap = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
};

const FIELD_VALIDATORS: Record<SettingsField, (value: unknown) => boolean> = {
  soldadoPrice: isValidPrice,
  servidorPrice: isValidPrice,
  fridayDate: isValidDayOfMonth,
  saturdayDate: isValidDayOfMonth,
  sundayDate: isValidDayOfMonth,
  retreatMonth: isValidMonth,
  retreatYear: isValidYear,
  advanceStartDay: isValidDayOfMonth,
  advanceEndDay: isValidDayOfMonth,
  advanceMonth: isValidMonth,
  finalPaymentStartDay: isValidDayOfMonth,
  finalPaymentEndDay: isValidDayOfMonth,
  finalPaymentMonth: isValidMonth,
  subsidyCap: isValidCap,
};

const SETTINGS_FIELDS = Object.keys(FIELD_VALIDATORS) as SettingsField[];

const toResponse = (settings: SettingsDoc) => ({
  soldadoPrice: settings.soldadoPrice,
  servidorPrice: settings.servidorPrice,
  fridayDate: settings.fridayDate,
  saturdayDate: settings.saturdayDate,
  sundayDate: settings.sundayDate,
  retreatMonth: settings.retreatMonth,
  retreatYear: settings.retreatYear,
  advanceStartDay: settings.advanceStartDay,
  advanceEndDay: settings.advanceEndDay,
  advanceMonth: settings.advanceMonth,
  finalPaymentStartDay: settings.finalPaymentStartDay,
  finalPaymentEndDay: settings.finalPaymentEndDay,
  finalPaymentMonth: settings.finalPaymentMonth,
  subsidyCap: settings.subsidyCap,
});

export const getSettingsHandler = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json(toResponse(settings));
});

export const getPublicSettingsHandler = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  const { subsidyCap: _subsidyCap, ...publicFields } = toResponse(settings);
  res.json(publicFields);
});

export const updateSettingsHandler = asyncHandler(async (req, res) => {
  const body = req.body as Partial<Record<SettingsField, unknown>>;
  const updates = SETTINGS_FIELDS.filter((f) => body[f] !== undefined);

  if (updates.length === 0) {
    throw new ApiError(400, "Nada para actualizar");
  }

  const settings = await getSettings();
  const changes: string[] = [];

  for (const field of updates) {
    const value = body[field];
    if (!FIELD_VALIDATORS[field](value)) {
      throw new ApiError(400, `Valor inválido para ${FIELD_LABELS[field]}`);
    }
    changes.push(`${FIELD_LABELS[field]}: ${settings[field]} → ${Number(value)}`);
    settings[field] = Number(value);
  }

  await settings.save();

  await createLog(req.user!, "EDITAR_CONFIGURACION", `Actualizó configuración (${changes.join(", ")})`);

  res.json(toResponse(settings));
});

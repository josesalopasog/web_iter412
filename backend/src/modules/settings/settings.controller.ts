import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import { getSettings } from "./settings.service.js";
import type { SettingsDoc } from "./settings.service.js";

type SettingsField =
  | "retreatNumber"
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
  | "subsidyCap"
  | "shirtPrice"
  | "busoChaquetaPrice"
  | "canguroPrice"
  | "tulaPrice"
  | "cachuchaPrice"
  | "extraSizePrice";

const FIELD_LABELS: Record<SettingsField, string> = {
  retreatNumber: "número del retiro",
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
  shirtPrice: "precio camiseta manga corta",
  busoChaquetaPrice: "precio chaqueta o buso",
  canguroPrice: "precio canguro",
  tulaPrice: "precio tula",
  cachuchaPrice: "precio cachucha",
  extraSizePrice: "recargo talla especial (XL o más)",
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

const isValidRetreatNumber = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isInteger(num) && num >= 1 && num <= 100;
};

const isValidCap = (value: unknown): value is number => {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
};

const FIELD_VALIDATORS: Record<SettingsField, (value: unknown) => boolean> = {
  retreatNumber: isValidRetreatNumber,
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
  shirtPrice: isValidPrice,
  busoChaquetaPrice: isValidPrice,
  canguroPrice: isValidPrice,
  tulaPrice: isValidPrice,
  cachuchaPrice: isValidPrice,
  extraSizePrice: isValidCap,
};

const SETTINGS_FIELDS = Object.keys(FIELD_VALIDATORS) as SettingsField[];

const MERCH_FIELDS: SettingsField[] = [
  "shirtPrice",
  "busoChaquetaPrice",
  "canguroPrice",
  "tulaPrice",
  "cachuchaPrice",
  "extraSizePrice",
];

const toResponse = (settings: SettingsDoc) => ({
  retreatNumber: settings.retreatNumber,
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
  serviceSignupOpen: settings.serviceSignupOpen !== false,
  merchOrdersOpen: settings.merchOrdersOpen !== false,
  retreatInfoOpen: settings.retreatInfoOpen !== false,
  shirtPrice: settings.shirtPrice,
  busoChaquetaPrice: settings.busoChaquetaPrice,
  canguroPrice: settings.canguroPrice,
  tulaPrice: settings.tulaPrice,
  cachuchaPrice: settings.cachuchaPrice,
  extraSizePrice: settings.extraSizePrice,
});

export const getSettingsHandler = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  res.json(toResponse(settings));
});

export const getPublicSettingsHandler = asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  const {
    subsidyCap: _subsidyCap,
    shirtPrice: _shirtPrice,
    busoChaquetaPrice: _busoChaquetaPrice,
    canguroPrice: _canguroPrice,
    tulaPrice: _tulaPrice,
    cachuchaPrice: _cachuchaPrice,
    extraSizePrice: _extraSizePrice,
    ...publicFields
  } = toResponse(settings);
  res.json(publicFields);
});

const applySettingsUpdate = async (
  req: Request,
  res: Response,
  allowedFields: SettingsField[],
  logSummaryPrefix: string
) => {
  const body = req.body as Partial<Record<SettingsField, unknown>>;
  const updates = allowedFields.filter((f) => body[f] !== undefined);

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

  await createLog(req.user!, "EDITAR_CONFIGURACION", `${logSummaryPrefix} (${changes.join(", ")})`);

  res.json(toResponse(settings));
};

export const updateSettingsHandler = asyncHandler(async (req, res) => {
  await applySettingsUpdate(req, res, SETTINGS_FIELDS, "Actualizó configuración");
});

export const updateMerchSettingsHandler = asyncHandler(async (req, res) => {
  await applySettingsUpdate(req, res, MERCH_FIELDS, "Actualizó precios de merch");
});

/** PATCH /api/settings/service-signup { open }: habilita o bloquea "Activo para servir" en el perfil. */
export const updateServiceSignupHandler = asyncHandler(async (req, res) => {
  const { open } = req.body as { open?: unknown };
  if (typeof open !== "boolean") throw new ApiError(400, "Indica si se abre (true o false)");
  const settings = await getSettings();
  settings.serviceSignupOpen = open;
  await settings.save();
  await createLog(
    req.user!,
    "EDITAR_CONFIGURACION",
    open
      ? "Habilitó que los servidores se activen para servir desde su perfil"
      : "Bloqueó que los servidores se activen para servir desde su perfil"
  );
  res.json(toResponse(settings));
});

/** Interruptores de la página: quién puede cambiarlos y qué queda en el registro de actividad. */
const SWITCHES = {
  serviceSignupOpen: {
    roles: ["SUPERADMIN", "TREASURER"],
    on: "Habilitó que los servidores se activen para servir desde su perfil",
    off: "Bloqueó que los servidores se activen para servir desde su perfil",
  },
  merchOrdersOpen: {
    roles: ["ADMIN", "SUPERADMIN", "TREASURER"],
    on: "Activó la creación de órdenes de merch desde el perfil",
    off: "Desactivó la creación de órdenes de merch desde el perfil",
  },
  retreatInfoOpen: {
    roles: ["SUPERADMIN", "TREASURER"],
    on: "Abrió la información e inscripción del retiro",
    off: "Cerró la información e inscripción del retiro",
  },
} as const;
type SwitchKey = keyof typeof SWITCHES;

/** PATCH /api/settings/switch { key, open }: abre o cierra una función de la página. */
export const updateSwitchHandler = asyncHandler(async (req, res) => {
  const { key, open } = req.body as { key?: unknown; open?: unknown };
  if (typeof key !== "string" || !(key in SWITCHES)) throw new ApiError(400, "Opción inválida");
  if (typeof open !== "boolean") throw new ApiError(400, "Indica si se abre (true o false)");
  const config = SWITCHES[key as SwitchKey];
  if (!(config.roles as readonly string[]).includes(req.user!.role)) throw new ApiError(403, "No autorizado");
  const settings = await getSettings();
  settings[key as SwitchKey] = open;
  await settings.save();
  await createLog(req.user!, "EDITAR_CONFIGURACION", open ? config.on : config.off);
  res.json(toResponse(settings));
});

/** GET /api/settings/merch-prices: precios de merch para cualquier servidor con sesión (su pedido). */
export const getMerchPricesHandler = asyncHandler(async (_req, res) => {
  const s = toResponse(await getSettings());
  res.json({
    shirtPrice: s.shirtPrice,
    busoChaquetaPrice: s.busoChaquetaPrice,
    canguroPrice: s.canguroPrice,
    tulaPrice: s.tulaPrice,
    cachuchaPrice: s.cachuchaPrice,
    extraSizePrice: s.extraSizePrice,
  });
});

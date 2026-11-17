import { API_URL, authedRequest } from "./http";

export type AppSettings = {
  retreatNumber: number;
  soldadoPrice: number;
  servidorPrice: number;
  fridayDate: number;
  saturdayDate: number;
  sundayDate: number;
  retreatMonth: number;
  retreatYear: number;
  advanceStartDay: number;
  advanceEndDay: number;
  advanceMonth: number;
  finalPaymentStartDay: number;
  finalPaymentEndDay: number;
  finalPaymentMonth: number;
  subsidyCap: number;
  shirtPrice: number;
  busoChaquetaPrice: number;
  canguroPrice: number;
  tulaPrice: number;
  cachuchaPrice: number;
  extraSizePrice: number;
};

/** Lo que devuelve el backend: los ajustes numéricos más si "Activo para servir" está habilitado. */
export type SettingsSwitches = {
  /** "Activo para servir" habilitado en el perfil. */
  serviceSignupOpen: boolean;
  /** Los servidores pueden crear órdenes de merch desde el perfil. */
  merchOrdersOpen: boolean;
  /** La página del retiro (/inscribirme) muestra la información y la inscripción. */
  retreatInfoOpen: boolean;
};
export type SwitchKey = keyof SettingsSwitches;

export type SettingsResponse = AppSettings & SettingsSwitches;

export type PublicSettings = {
  /** false: en el perfil "Activo para servir" queda bloqueado hasta el próximo retiro. */
  serviceSignupOpen?: boolean;
  merchOrdersOpen?: boolean;
  retreatInfoOpen?: boolean;
  retreatNumber: number;
  soldadoPrice: number;
  servidorPrice: number;
  fridayDate: number;
  saturdayDate: number;
  sundayDate: number;
  retreatMonth: number;
  retreatYear: number;
  advanceStartDay: number;
  advanceEndDay: number;
  advanceMonth: number;
  finalPaymentStartDay: number;
  finalPaymentEndDay: number;
  finalPaymentMonth: number;
};


export const getSettings = () => authedRequest<SettingsResponse>("/api/settings");

export const updateSwitch = (key: SwitchKey, open: boolean) =>
  authedRequest<SettingsResponse>("/api/settings/switch", {
    method: "PATCH",
    body: JSON.stringify({ key, open }),
  });

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const res = await fetch(`${API_URL}/api/settings/public`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error de solicitud";
    throw new Error(msg);
  }
  return data as PublicSettings;
};

export const updateSettings = (changes: Partial<AppSettings>) =>
  authedRequest<AppSettings>("/api/settings", {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

export const updateMerchSettings = (changes: Partial<AppSettings>) =>
  authedRequest<AppSettings>("/api/settings/merch-prices", {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

export type MerchPrices = Pick<AppSettings, "shirtPrice" | "busoChaquetaPrice" | "canguroPrice" | "tulaPrice" | "cachuchaPrice" | "extraSizePrice">;

/** Precios de merch para el pedido de cada servidor (cualquiera con sesión). */
export const getMerchPrices = () => authedRequest<MerchPrices>("/api/settings/merch-prices");

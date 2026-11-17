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
export type SettingsResponse = AppSettings & { serviceSignupOpen: boolean };

export type PublicSettings = {
  /** false: en el perfil "Activo para servir" queda bloqueado hasta el próximo retiro. */
  serviceSignupOpen?: boolean;
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

export const updateServiceSignup = (open: boolean) =>
  authedRequest<SettingsResponse>("/api/settings/service-signup", {
    method: "PATCH",
    body: JSON.stringify({ open }),
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

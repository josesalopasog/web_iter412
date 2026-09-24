import { API_URL, authedRequest } from "./http";

export type AppSettings = {
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

export type PublicSettings = {
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


export const getSettings = () => authedRequest<AppSettings>("/api/settings");

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

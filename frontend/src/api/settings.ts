const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

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

const authedRequest = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error de solicitud";
    throw new Error(msg);
  }

  return data as T;
};

export const getSettings = (token: string) => authedRequest<AppSettings>("/api/settings", token);

export const getPublicSettings = async (): Promise<PublicSettings> => {
  const res = await fetch(`${API_URL}/api/settings/public`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error de solicitud";
    throw new Error(msg);
  }
  return data as PublicSettings;
};

export const updateSettings = (token: string, changes: Partial<AppSettings>) =>
  authedRequest<AppSettings>("/api/settings", token, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

export const updateMerchSettings = (token: string, changes: Partial<AppSettings>) =>
  authedRequest<AppSettings>("/api/settings/merch-prices", token, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

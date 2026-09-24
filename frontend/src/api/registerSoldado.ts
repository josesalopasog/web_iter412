import type { RegisterSoldadoPayload } from "../pages/Register/form/types";

import { API_URL } from "./http";

export type RegisterSoldadoResponse = {
  id: string;
  registrationNumber: string;
  email: string;
  role: string;
  createdAt: string;
};

export const registerSoldado = async (
  payload: RegisterSoldadoPayload
): Promise<RegisterSoldadoResponse> => {
  const res = await fetch(`${API_URL}/api/users/soldados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = typeof data?.message === "string" ? data.message : "Error registrando soldado";
    throw new Error(msg);
  }

  return data as RegisterSoldadoResponse;
};
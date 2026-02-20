import type { RegisterSoldadoPayload } from "../pages/Register/form/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export type RegisterSoldadoResponse = {
  id: string;
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
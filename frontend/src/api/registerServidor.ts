import type { RegistrationServidoresDTO } from "../pages/Servidores/form/types";

import { API_URL } from "./http";

export const registerServidor = async (payload: RegistrationServidoresDTO) => {
  const res = await fetch(`${API_URL}/api/users/servidores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message ?? "Error registrando servidor");
  }

  return res.json() as Promise<{ id: string; registrationNumber: string }>;
};
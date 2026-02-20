import type { RegistrationServidoresDTO } from "../pages/Servidores/form/types";

const API_URL = import.meta.env.VITE_API_URL;

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

  return res.json() as Promise<{ id: string }>;
};
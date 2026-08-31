const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export type SoldadoRecord = {
  _id: string;
  registrationNumber: number;
  gender: string;
  firstNames: string;
  lastNames: string;
  documentNumber: string;
  phone: string;
  city: string;
  createdAt: string;
  [key: string]: unknown;
};

export type ServidorRecord = {
  _id: string;
  registrationNumber: number;
  role: string;
  gender?: string;
  firstNames: string;
  lastNames: string;
  email: string;
  documentNumber: string;
  phone: string;
  city: string;
  createdAt: string;
  [key: string]: unknown;
};

export type EliminadoRecord = {
  _id: string;
  originalCollection: "soldados" | "servidores";
  originalId: string;
  registrationNumber: number;
  data: Record<string, unknown>;
  deletedAt: string;
  deletedBy: { sub: string; email: string; firstNames: string; lastNames: string };
};

const authedRequest = async <T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> => {
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

export const listSoldados = (token: string) =>
  authedRequest<SoldadoRecord[]>("/api/users/soldados", token);

export const listServidores = (token: string) =>
  authedRequest<ServidorRecord[]>("/api/users/servidores", token);

export const getMyServidorProfile = (token: string) =>
  authedRequest<Record<string, unknown>>("/api/users/servidores/me", token);

export const updateSoldadoField = (token: string, id: string, field: string, value: unknown) =>
  authedRequest<SoldadoRecord>(`/api/users/soldados/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ field, value }),
  });

export const updateServidorField = (token: string, id: string, field: string, value: unknown) =>
  authedRequest<ServidorRecord>(`/api/users/servidores/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify({ field, value }),
  });

export const updateServidorRole = (token: string, id: string, role: string) =>
  authedRequest<ServidorRecord>(`/api/users/servidores/${id}/role`, token, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const deleteSoldado = (token: string, id: string) =>
  authedRequest<{ ok: true }>(`/api/users/soldados/${id}`, token, { method: "DELETE" });

export const deleteServidor = (token: string, id: string) =>
  authedRequest<{ ok: true }>(`/api/users/servidores/${id}`, token, { method: "DELETE" });

export const listEliminados = (token: string) =>
  authedRequest<EliminadoRecord[]>("/api/users/eliminados", token);

export const restoreEliminado = (token: string, id: string) =>
  authedRequest<Record<string, unknown>>(`/api/users/eliminados/${id}/restore`, token, {
    method: "POST",
  });

import { authedRequest, setAccessToken } from "./http";

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
  paymentAmount: number;
  subsidyAmount: number;
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
  paymentAmount: number;
  subsidyAmount: number;
  merchPaymentAmount: number;
  [key: string]: unknown;
};

export type EliminadoRecord = {
  _id: string;
  originalCollection: "soldados" | "servidores";
  originalId: string;
  registrationNumber: number | undefined;
  data: Record<string, unknown>;
  deletedAt: string;
  deletedBy: { sub: string; email: string; firstNames: string; lastNames: string };
};

export type LogRecord = {
  _id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  summary: string;
  createdAt: string;
};

export const listSoldados = () =>
  authedRequest<SoldadoRecord[]>("/api/users/soldados");

export const listServidores = () =>
  authedRequest<ServidorRecord[]>("/api/users/servidores");

export const getServidorByDocument = (documentNumber: string) =>
  authedRequest<Record<string, unknown>>(
    `/api/users/servidores/by-document/${encodeURIComponent(documentNumber)}`,
  );

export const getSoldadoByDocument = (documentNumber: string) =>
  authedRequest<Record<string, unknown>>(
    `/api/users/soldados/by-document/${encodeURIComponent(documentNumber)}`,
  );

export const getMyServidorProfile =() =>
  authedRequest<Record<string, unknown>>("/api/users/servidores/me");

export const updateSoldadoField = (id: string, field: string, value: unknown) =>
  authedRequest<SoldadoRecord>(`/api/users/soldados/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ field, value }),
  });

export const updateServidorField = (id: string, field: string, value: unknown) =>
  authedRequest<ServidorRecord>(`/api/users/servidores/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ field, value }),
  });

export const updateMyServidorField = (field: string, value: unknown) =>
  authedRequest<ServidorRecord>("/api/users/servidores/me", {
    method: "PATCH",
    body: JSON.stringify({ field, value }),
  });

export const changeMyPassword = async (oldPassword: string, newPassword: string) => {
  const result = await authedRequest<{ ok: true; token: string }>("/api/users/servidores/me/password", {
    method: "PATCH",
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  // El cambio de contraseña revoca los tokens anteriores; esta sesión sigue con el nuevo.
  setAccessToken(result.token);
};

export const updateServidorRole = (id: string, role: string) =>
  authedRequest<ServidorRecord>(`/api/users/servidores/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

export const deleteSoldado = (id: string) =>
  authedRequest<{ ok: true }>(`/api/users/soldados/${id}`, { method: "DELETE" });

export const deleteServidor = (id: string) =>
  authedRequest<{ ok: true }>(`/api/users/servidores/${id}`, { method: "DELETE" });

export const resetServidorMerch = (id: string) =>
  authedRequest<ServidorRecord>(`/api/users/servidores/${id}/reset-merch`, {
    method: "PATCH",
  });

export const listEliminados = () =>
  authedRequest<EliminadoRecord[]>("/api/users/eliminados");

export const restoreEliminado = (id: string) =>
  authedRequest<Record<string, unknown>>(`/api/users/eliminados/${id}/restore`, {
    method: "POST",
  });

export const listLogs = () => authedRequest<LogRecord[]>("/api/logs");

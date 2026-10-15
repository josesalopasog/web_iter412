import { authedRequest } from "./http";

export type CustomNotificationRecord = {
  _id: string;
  title: string;
  body: string;
  /** null = se muestra siempre (hasta que se elimine). */
  expiresAt: string | null;
  createdBy?: string;
  createdAt: string;
};

export type CustomNotificationInput = {
  title: string;
  body: string;
  /** null = mostrar siempre. */
  durationDays: number | null;
};

export const listCustomNotifications = () => authedRequest<CustomNotificationRecord[]>("/api/notifications");

export const createCustomNotification = (payload: CustomNotificationInput) =>
  authedRequest<CustomNotificationRecord>("/api/notifications", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const deleteCustomNotification = (id: string) =>
  authedRequest<{ ok: true }>(`/api/notifications/${id}`, { method: "DELETE" });

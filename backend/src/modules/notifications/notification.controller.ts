import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import { Notification } from "./notification.model.js";

const MAX_TITLE = 80;
const MAX_BODY = 300;
const MAX_DAYS = 365;
const DAY_MS = 24 * 60 * 60 * 1000;

// El índice TTL de MongoDB corre cada ~60 s; esto asegura que una vencida no se alcance a mostrar.
const purgeExpired = () => Notification.deleteMany({ expiresAt: { $ne: null, $lte: new Date() } });

export const listNotifications = asyncHandler(async (_req, res) => {
  await purgeExpired();
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
});

export const createNotification = asyncHandler(async (req, res) => {
  const { title, body, durationDays } = req.body as {
    title?: unknown;
    body?: unknown;
    durationDays?: unknown;
  };

  const cleanTitle = typeof title === "string" ? title.trim() : "";
  const cleanBody = typeof body === "string" ? body.trim() : "";
  if (!cleanTitle) throw new ApiError(400, "El título es obligatorio");
  if (!cleanBody) throw new ApiError(400, "El mensaje es obligatorio");
  if (cleanTitle.length > MAX_TITLE) throw new ApiError(400, `El título admite máximo ${MAX_TITLE} caracteres`);
  if (cleanBody.length > MAX_BODY) throw new ApiError(400, `El mensaje admite máximo ${MAX_BODY} caracteres`);

  // durationDays null = mostrar siempre.
  let expiresAt: Date | null = null;
  if (durationDays !== null) {
    const days = Number(durationDays);
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      throw new ApiError(400, `La duración debe ser entre 1 y ${MAX_DAYS} días`);
    }
    expiresAt = new Date(Date.now() + days * DAY_MS);
  }

  const user = req.user!;
  const notification = await Notification.create({
    title: cleanTitle,
    body: cleanBody,
    expiresAt,
    createdBy: `${user.firstNames} ${user.lastNames}`.trim(),
  });

  await createLog(
    user,
    "CREAR_NOTIFICACION",
    `Publicó la notificación "${notification.title}" (${expiresAt ? `por ${durationDays} días` : "sin vencimiento"})`
  );

  res.status(201).json(notification);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) throw new ApiError(404, "Notificación no encontrada");

  await notification.deleteOne();

  await createLog(req.user!, "ELIMINAR_NOTIFICACION", `Eliminó la notificación "${notification.title}"`);

  res.json({ ok: true });
});

import mongoose, { Schema } from "mongoose";

// Notificaciones personalizadas que los admins publican desde el dashboard de eventos.
const NotificationSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },
    // null = se muestra siempre (hasta que un admin la elimine).
    expiresAt: { type: Date, default: null },
    createdBy: { type: String, default: "", trim: true },
  },
  { timestamps: true, collection: "notifications" }
);

// MongoDB borra sola la notificación cuando llega a expiresAt (los documentos con null no vencen).
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model("Notification", NotificationSchema);

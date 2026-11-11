import mongoose, { Schema } from "mongoose";

// Una visita = una página abierta en el frontend (sitio público o dashboard).
const PageViewSchema = new Schema(
  {
    path: { type: String, required: true, maxlength: 200 },
    // Id anónimo guardado en el navegador: sirve para contar visitantes únicos.
    visitorId: { type: String, maxlength: 64, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: "pageviews" }
);

PageViewSchema.index({ createdAt: -1 });

export const PageView = mongoose.model("PageView", PageViewSchema);

import mongoose, { Schema } from "mongoose";
import { EVENT_TAGS } from "./event.types.js";

const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },

    // Fechas en formato "YYYY-MM-DD", igual que en el resto del proyecto (settings, soldados).
    dateISO: { type: String, required: true },
    start: { type: String, default: "", trim: true },
    end: { type: String, default: "", trim: true },
    // Para eventos de varios días (p. ej. el retiro): si no se da, el evento termina el mismo dateISO.
    endDateISO: { type: String, default: "" },

    location: { type: String, default: "", trim: true },
    tag: { type: String, enum: EVENT_TAGS, default: "Reunión" },
    description: { type: String, default: "", trim: true },
    isOpen: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "events" }
);

export const Event = mongoose.model("Event", EventSchema);

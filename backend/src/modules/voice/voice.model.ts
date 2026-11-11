import mongoose, { Schema } from "mongoose";

// "Tu voz en ITER": sugerencias, actividades y peticiones de oración. Las calificaciones de
// reuniones viven en events/rating.
export const VOICE_TYPES = ["SUGERENCIA", "ACTIVIDAD", "ORACION"] as const;
export type VoiceType = (typeof VOICE_TYPES)[number];

/** Tipos que se pueden enviar de forma anónima (hoy, todos). */
export const ANONYMOUS_TYPES: VoiceType[] = ["SUGERENCIA", "ACTIVIDAD", "ORACION"];

export const VOICE_TARGETS = ["COMITE", "EQUIPO_RETIRO"] as const; // A quién va la sugerencia
export const VOICE_SPACES = ["FORMACION", "EXTRACURRICULAR"] as const; // Tipo de actividad
export const VOICE_VISIBILITY = ["COMITE", "COMUNIDAD", "EQUIPO_RETIRO"] as const; // Quién ve la oración
export const VOICE_STATUSES = ["NUEVO", "LEIDO", "ATENDIDO"] as const;

const VoiceSchema = new Schema(
  {
    type: { type: String, enum: VOICE_TYPES, required: true },
    anonymous: { type: Boolean, default: false },
    // Si es anónimo no se guarda quién lo envió (ni siquiera el id).
    userId: { type: String, default: null },
    userName: { type: String, default: null },
    userRole: { type: String, default: null },

    target: { type: String, enum: [...VOICE_TARGETS, ""], default: "" },
    space: { type: String, enum: [...VOICE_SPACES, ""], default: "" },
    visibility: { type: String, enum: [...VOICE_VISIBILITY, ""], default: "" },
    topic: { type: String, default: "", trim: true, maxlength: 120 },
    text: { type: String, required: true, trim: true, maxlength: 2000 },

    status: { type: String, enum: VOICE_STATUSES, default: "NUEVO" },
  },
  { timestamps: true, collection: "voice" }
);

VoiceSchema.index({ createdAt: -1 });

export const Voice = mongoose.model("Voice", VoiceSchema);

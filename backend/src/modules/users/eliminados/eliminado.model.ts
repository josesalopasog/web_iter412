import mongoose, { Schema } from "mongoose";

const EliminadoSchema = new Schema({
  originalCollection: { type: String, enum: ["soldados", "servidores"], required: true },
  originalId: { type: String, required: true },
  registrationNumber: { type: Number, required: true },

  data: { type: Schema.Types.Mixed, required: true },

  deletedAt: { type: Date, required: true, default: Date.now },
  deletedBy: {
    sub: { type: String, required: true },
    email: { type: String, required: true },
    firstNames: { type: String, required: true },
    lastNames: { type: String, required: true },
  },
});

export const Eliminado = mongoose.model("Eliminado", EliminadoSchema, "eliminados");

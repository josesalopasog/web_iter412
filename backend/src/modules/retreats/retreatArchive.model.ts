import mongoose, { Schema } from "mongoose";

// Copia de un retiro finalizado: ajustes, participantes (soldados que asistieron) y cómo estaban
// los servidores en ese momento. Solo se consulta; nada del día a día depende de esta colección.
const RetreatArchiveSchema = new Schema(
  {
    retreatNumber: { type: Number, required: true },
    retreatYear: { type: Number, required: true },
    retreatMonth: { type: Number, required: true },
    settings: { type: Schema.Types.Mixed, required: true },
    participantes: { type: [Schema.Types.Mixed], default: [] },
    servidores: { type: [Schema.Types.Mixed], default: [] },
    totals: {
      participantes: { type: Number, default: 0 },
      hombres: { type: Number, default: 0 },
      mujeres: { type: Number, default: 0 },
      servidores: { type: Number, default: 0 },
      servidoresActivos: { type: Number, default: 0 },
      soldadosPagado: { type: Number, default: 0 },
      soldadosSubsidio: { type: Number, default: 0 },
      servidoresPagado: { type: Number, default: 0 },
      servidoresSubsidio: { type: Number, default: 0 },
      inscripcionesPendientes: { type: Number, default: 0 },
    },
    finishedBy: {
      sub: String,
      email: String,
      firstNames: String,
      lastNames: String,
    },
  },
  { timestamps: true, collection: "retreatArchives" }
);

export const RetreatArchive = mongoose.model("RetreatArchive", RetreatArchiveSchema);

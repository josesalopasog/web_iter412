import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import { getSettings } from "../settings/settings.service.js";
import { Soldado } from "../users/soldados/soldado.model.js";
import { Servidor } from "../users/servidores/servidor.model.js";
import { compactRegistrationNumbers } from "../users/registrationNumbers.js";
import { RetreatArchive } from "./retreatArchive.model.js";

const isHombre = (g: unknown) => String(g ?? "").toUpperCase().startsWith("HOMBRE") || String(g ?? "").toUpperCase() === "MASCULINO";
const isMujer = (g: unknown) => String(g ?? "").toUpperCase().startsWith("MUJER") || String(g ?? "").toUpperCase() === "FEMENINO";
const sum = (list: Record<string, unknown>[], key: string) => list.reduce((s, d) => s + (Number(d[key]) || 0), 0);

/**
 * POST /api/retreats/finish { confirmNumber }
 * Guarda una copia del retiro actual y deja todo listo para el siguiente:
 * - Los participantes (soldados que asistieron) se archivan y salen de la tabla (queda en 0).
 * - Las inscripciones de soldados que no asistieron se mantienen.
 * - Todos los servidores quedan inactivos y su pago/subsidio del retiro vuelve a 0 (queda en la copia).
 * - "Activo para servir" se bloquea en el perfil hasta que se vuelva a habilitar.
 * - El número del retiro sube en 1.
 * No toca reuniones, órdenes de merch (ni sus pagos o estados), Tu voz ni nada que no sea del retiro.
 */
export const finishRetreat = asyncHandler(async (req, res) => {
  const settings = await getSettings();
  const { confirmNumber } = req.body as { confirmNumber?: unknown };
  if (Number(confirmNumber) !== settings.retreatNumber) {
    throw new ApiError(400, "Confirma escribiendo el número del retiro que vas a finalizar");
  }

  const participantes = (await Soldado.find({ attended: true }).sort({ registrationNumber: 1 }).lean()) as Record<string, unknown>[];
  const servidores = (await Servidor.find().sort({ registrationNumber: 1 }).select("-passwordHash -tokenVersion").lean()) as Record<
    string,
    unknown
  >[];
  const pendientes = await Soldado.countDocuments({ attended: { $ne: true } });

  const settingsSnapshot = settings.toObject() as Record<string, unknown>;
  delete settingsSnapshot._id;
  delete settingsSnapshot.__v;

  // 1) Primero la copia: si algo falla después, los datos ya quedaron guardados.
  const archive = await RetreatArchive.create({
    retreatNumber: settings.retreatNumber,
    retreatYear: settings.retreatYear,
    retreatMonth: settings.retreatMonth,
    settings: settingsSnapshot,
    participantes,
    servidores,
    totals: {
      participantes: participantes.length,
      hombres: participantes.filter((p) => isHombre(p.gender)).length,
      mujeres: participantes.filter((p) => isMujer(p.gender)).length,
      servidores: servidores.length,
      servidoresActivos: servidores.filter((s) => s.serviceStatus === "ACTIVO").length,
      soldadosPagado: sum(participantes, "paymentAmount"),
      soldadosSubsidio: sum(participantes, "subsidyAmount"),
      servidoresPagado: sum(servidores, "paymentAmount"),
      servidoresSubsidio: sum(servidores, "subsidyAmount"),
      inscripcionesPendientes: pendientes,
    },
    finishedBy: {
      sub: req.user!.sub,
      email: req.user!.email,
      firstNames: req.user!.firstNames,
      lastNames: req.user!.lastNames,
    },
  });

  // 2) Participantes a 0 (ya están en la copia) y se renumeran las inscripciones que quedan.
  await Soldado.deleteMany({ attended: true });
  await compactRegistrationNumbers(Soldado);

  // 3) Servidores inactivos y sin pago del retiro. Las órdenes de merch (colección "orders") y
  //    lo pagado en ellas no se tocan: siguen igual después de finalizar.
  await Servidor.updateMany({}, { $set: { serviceStatus: "INACTIVO", paymentAmount: 0, subsidyAmount: 0 } });

  // 4) Bloquear "Activo para servir" y pasar al siguiente retiro.
  const finishedNumber = settings.retreatNumber;
  settings.serviceSignupOpen = false;
  settings.retreatNumber = Math.min(100, finishedNumber + 1);
  await settings.save();

  await createLog(
    req.user!,
    "FINALIZAR_RETIRO",
    `Finalizó el retiro ${finishedNumber}: ${participantes.length} participantes archivados, ${servidores.length} servidores inactivos, ${pendientes} inscripciones se mantienen`
  );

  res.json({ ok: true, archiveId: archive._id, retreatNumber: settings.retreatNumber });
});

/** GET /api/retreats/archives: retiros finalizados (solo el resumen). */
export const listArchives = asyncHandler(async (_req, res) => {
  const archives = await RetreatArchive.find()
    .select("retreatNumber retreatYear retreatMonth totals finishedBy createdAt")
    .sort({ createdAt: -1 })
    .lean();
  res.json(archives);
});

/** GET /api/retreats/archives/:id: la copia completa (participantes y servidores). */
export const getArchive = asyncHandler(async (req, res) => {
  const archive = await RetreatArchive.findById(req.params.id).lean();
  if (!archive) throw new ApiError(404, "No encontrado");
  res.json(archive);
});

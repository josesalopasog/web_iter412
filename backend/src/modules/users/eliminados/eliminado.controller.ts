import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/errors.js";
import { createLog } from "../../logs/createLog.js";
import { Eliminado } from "./eliminado.model.js";
import { Soldado } from "../soldados/soldado.model.js";
import { Servidor } from "../servidores/servidor.model.js";

export const listEliminados = asyncHandler(async (_req, res) => {
  const eliminados = await Eliminado.find().sort({ deletedAt: -1 });
  res.json(eliminados);
});

export const restoreEliminado = asyncHandler(async (req, res) => {
  const eliminado = await Eliminado.findById(req.params.id);
  if (!eliminado) throw new ApiError(404, "No encontrado");

  const Model: any = eliminado.originalCollection === "soldados" ? Soldado : Servidor;
  const data = { ...(eliminado.data as Record<string, unknown>) };
  data._id = eliminado.originalId;

  const numberTaken =
    eliminado.registrationNumber != null &&
    (await Model.exists({ registrationNumber: eliminado.registrationNumber }));

  if (!eliminado.registrationNumber || numberTaken) {
    data.registrationNumber = (await Model.countDocuments()) + 1;
  }

  const restored = await Model.create(data);
  await eliminado.deleteOne();

  await createLog(
    req.user!,
    "RESTAURAR",
    `Restauró a ${restored.firstNames} ${restored.lastNames} (${eliminado.originalCollection === "soldados" ? "SOLDADO" : "SERVIDOR"}) - N° registro ${String(restored.registrationNumber).padStart(3, "0")}`
  );

  res.json(restored);
});

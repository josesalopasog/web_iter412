import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/errors.js";
import { createLog } from "../../activityLog/createLog.js";
import { Eliminado } from "./eliminado.model.js";
import { Soldado } from "../soldados/soldado.model.js";
import { Servidor } from "../servidores/servidor.model.js";
import { compactRegistrationNumbers, provisionalRegistrationNumber } from "../registrationNumbers.js";

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

  // Vuelve a su posición original (los de abajo se corren un puesto); sin número, queda al final.
  data.registrationNumber = eliminado.registrationNumber
    ? await provisionalRegistrationNumber(Model, eliminado.registrationNumber)
    : (await Model.countDocuments()) + 1;

  const created = await Model.create(data);
  await eliminado.deleteOne();
  await compactRegistrationNumbers(Model);
  const restored = await Model.findById(created._id);

  await createLog(
    req.user!,
    "RESTAURAR",
    `Restauró a ${restored.firstNames} ${restored.lastNames} (${eliminado.originalCollection === "soldados" ? "SOLDADO" : "SERVIDOR"}) - N° registro ${String(restored.registrationNumber).padStart(3, "0")}`
  );

  res.json(restored);
});

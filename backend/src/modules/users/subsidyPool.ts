import { Soldado } from "./soldados/soldado.model.js";
import { Servidor } from "./servidores/servidor.model.js";

const sumSubsidy = async (Model: typeof Soldado | typeof Servidor): Promise<number> => {
  const result = await Model.aggregate([{ $group: { _id: null, total: { $sum: "$subsidyAmount" } } }]);
  return result[0]?.total ?? 0;
};

/** Total subsidy already granted across both soldados and servidores. */
export const getTotalSubsidyUsed = async (): Promise<number> => {
  const [soldadoTotal, servidorTotal] = await Promise.all([sumSubsidy(Soldado), sumSubsidy(Servidor)]);
  return soldadoTotal + servidorTotal;
};

import type { AuthUser } from "../../types/express.js";
import { Eliminado } from "./eliminados/eliminado.model.js";

type Deletable = {
  _id: unknown;
  registrationNumber: number;
  toObject: () => Record<string, unknown>;
};

export const softDelete = async (
  doc: Deletable,
  originalCollection: "soldados" | "servidores",
  deletedBy: AuthUser
) => {
  const data = doc.toObject();

  await Eliminado.create({
    originalCollection,
    originalId: String(doc._id),
    registrationNumber: doc.registrationNumber,
    data,
    deletedBy: {
      sub: deletedBy.sub,
      email: deletedBy.email,
      firstNames: deletedBy.firstNames,
      lastNames: deletedBy.lastNames,
    },
  });
};

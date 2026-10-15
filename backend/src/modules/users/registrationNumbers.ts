import type { Model } from "mongoose";

// Deja los números de registro consecutivos (1..N) respetando el orden actual. Se usa después de
// eliminar, restaurar o mover a alguien: si se elimina el #3, el #4 pasa a ser el #3 y así hacia abajo.
// Se hace en dos fases (primero a negativos) para no chocar con el índice único durante el cambio.
export const compactRegistrationNumbers = async (Collection: Model<any>) => {
  const docs = await Collection.find({}, { _id: 1, registrationNumber: 1 })
    .sort({ registrationNumber: 1, createdAt: 1 })
    .lean<{ _id: unknown; registrationNumber: number }[]>();

  const changes = docs
    .map((doc, i) => ({ _id: doc._id, from: doc.registrationNumber, to: i + 1 }))
    .filter((c) => c.from !== c.to);
  if (changes.length === 0) return;

  await Collection.bulkWrite(
    changes.map((c) => ({
      updateOne: { filter: { _id: c._id }, update: { $set: { registrationNumber: -c.to } } },
    }))
  );
  await Collection.bulkWrite(
    changes.map((c) => ({
      updateOne: { filter: { _id: c._id }, update: { $set: { registrationNumber: c.to } } },
    }))
  );
};

// Número provisional para ubicar un registro en la posición `target` (antes de compactar):
// si la posición ya está ocupada queda justo antes (subiendo) o justo después (bajando) de quien la tiene.
export const provisionalRegistrationNumber = async (
  Collection: Model<any>,
  target: number,
  current?: number
) => {
  const taken = await Collection.exists({ registrationNumber: target });
  if (!taken || target === current) return target;
  return current != null && target > current ? target + 0.5 : target - 0.5;
};

/**
 * Borra los soldados de PRUEBA (correos @example.com con documento PRUEBA-*) y deja el # de
 * registro consecutivo otra vez. Solo para la base de desarrollo: se niega a correr si MONGO_URI
 * no apunta a una base "_dev".
 *
 *   npx tsx scripts/resetTestSoldados.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Soldado } from "../src/modules/users/soldados/soldado.model.js";
import { compactRegistrationNumbers } from "../src/modules/users/registrationNumbers.js";

const TEST_FILTER = { email: /@example\.com$/i, documentNumber: /^PRUEBA-/ };

const main = async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const dbName = mongoose.connection.db?.databaseName ?? "";
  if (!dbName.endsWith("_dev")) {
    throw new Error(`Por seguridad solo corre contra una base "_dev" (MONGO_URI apunta a "${dbName || "?"}").`);
  }

  const found = await Soldado.find(TEST_FILTER).select("registrationNumber firstNames lastNames email");
  for (const s of found) {
    console.log(`  - #${String(s.registrationNumber).padStart(3, "0")} ${s.firstNames} ${s.lastNames} <${s.email}>`);
  }
  const { deletedCount } = await Soldado.deleteMany(TEST_FILTER);
  await compactRegistrationNumbers(Soldado);
  console.log(`Eliminados ${deletedCount} soldados de prueba en "${dbName}".`);
};

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

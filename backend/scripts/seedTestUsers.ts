/**
 * Crea (o actualiza) dos cuentas de PRUEBA para iniciar sesión y ver la página como la vería cada rol:
 *   servidor.prueba@seed.iter412.test  → SERVIDOR
 *   admin.prueba@seed.iter412.test     → ADMIN
 * La contraseña de ambas sale de TEST_USERS_PASSWORD en backend/.env (no se versiona).
 * Solo para la base de desarrollo: se niega a correr si MONGO_URI no apunta a una base "_dev".
 *
 *   npx tsx scripts/seedTestUsers.ts            → crea o actualiza las cuentas
 *   npx tsx scripts/seedTestUsers.ts --remove   → las elimina
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Servidor } from "../src/modules/users/servidores/servidor.model.js";

const TEST_USERS = [
  { email: "servidor.prueba@seed.iter412.test", role: "SERVIDOR", firstNames: "Servidor", preferredName: "Servi" },
  { email: "admin.prueba@seed.iter412.test", role: "ADMIN", firstNames: "Admin", preferredName: "Admin" },
] as const;

const main = async () => {
  const uri = process.env.MONGO_URI ?? "";
  const dbName = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1] ?? "";
  if (!dbName.endsWith("_dev")) {
    throw new Error(`Por seguridad solo corre contra una base "_dev" (MONGO_URI apunta a "${dbName || "?"}").`);
  }

  await mongoose.connect(uri);
  console.log(`Conectado a ${dbName}`);

  if (process.argv.includes("--remove")) {
    const { deletedCount } = await Servidor.deleteMany({ email: { $in: TEST_USERS.map((u) => u.email) } });
    console.log(`Eliminadas ${deletedCount} cuentas de prueba.`);
    return;
  }

  const password = process.env.TEST_USERS_PASSWORD ?? "";
  if (password.length < 8) throw new Error("Define TEST_USERS_PASSWORD (8+ caracteres) en backend/.env");
  const passwordHash = await bcrypt.hash(password, 10);

  for (const [i, u] of TEST_USERS.entries()) {
    const existing = await Servidor.findOne({ email: u.email });
    if (existing) {
      existing.passwordHash = passwordHash;
      existing.role = u.role;
      existing.tokenVersion = (existing.tokenVersion ?? 0) + 1;
      await existing.save();
      console.log(`Actualizada: ${u.email} (${u.role})`);
      continue;
    }
    const last = await Servidor.findOne().sort({ registrationNumber: -1 }).select("registrationNumber").lean();
    await Servidor.create({
      registrationNumber: (last?.registrationNumber ?? 0) + 1,
      role: u.role,
      gender: "Hombre",
      email: u.email,
      passwordHash,
      firstNames: u.firstNames,
      lastNames: "De prueba",
      preferredName: u.preferredName,
      referralNamePhone: "Datos de prueba",
      documentType: "CC",
      documentNumber: `PRUEBA-LOGIN-${i + 1}`,
      city: "Bogotá",
      address: "Datos de prueba",
      birthDate: "2000-01-01",
      age: 25,
      phone: "3000000000",
      eps: "Datos de prueba",
      bloodType: "O+",
      needsShirt: "NO",
      emergencyFirstName: "Contacto",
      emergencyLastName: "De prueba",
      emergencyDocumentType: "CC",
      emergencyDocumentNumber: `PRUEBA-LOGIN-E-${i + 1}`,
      emergencyPhone: "3000000000",
      emergencyRelation: "Otro",
      emergencyEmail: `contacto.${u.email}`,
      emergencyAddress: "Datos de prueba",
      services: ["COMEDOR"],
      lastService: "COMEDOR",
      serviceLeaderOf: "Ninguno",
      wentToOtherSedes: "NO",
      formationOther: "Ninguna",
      serviceStatus: "ACTIVO",
      acceptTerms: true,
      acceptDataPolicy: true,
    });
    console.log(`Creada: ${u.email} (${u.role})`);
  }
};

main()
  .catch((error) => {
    console.error("❌", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

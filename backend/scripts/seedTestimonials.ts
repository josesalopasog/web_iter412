/**
 * Crea servidores de PRUEBA con testimonio para ver el carrusel de la página principal.
 * Solo para la base de desarrollo: se niega a correr si MONGO_URI no apunta a una base "_dev".
 *
 *   npx tsx scripts/seedTestimonials.ts            → crea (o actualiza) los servidores de prueba
 *   npx tsx scripts/seedTestimonials.ts --remove   → los elimina
 *
 * Todos usan correos @seed.iter412.test, así se distinguen de los reales y se borran fácil.
 */
import "dotenv/config";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Servidor } from "../src/modules/users/servidores/servidor.model.js";

const SEED_DOMAIN = "@seed.iter412.test";

const SEED = [
  {
    preferredName: "Josesito",
    firstNames: "José",
    lastNames: "Sánchez",
    gender: "Hombre",
    testimony:
      "En ITER viví el mejor fin de semana de mi vida y me gusta la comunidad porque me ayuda a aprender de Dios.",
  },
  {
    preferredName: "Lau",
    firstNames: "Laura",
    lastNames: "Martínez",
    gender: "Mujer",
    testimony:
      "Llegué sin esperar nada y salí sabiendo que Dios me ama tal como soy. Hoy sirvo para que otros vivan lo mismo.",
  },
  {
    preferredName: "Pipe",
    firstNames: "Andrés Felipe",
    lastNames: "Pardo",
    gender: "Hombre",
    testimony:
      "No vengas por obligación, ven con el corazón abierto. Aquí encontré amigos de verdad y un Jesús cercano que me abrazó.",
  },
  {
    preferredName: "Caro",
    firstNames: "Carolina",
    lastNames: "Rodríguez",
    gender: "Mujer",
    testimony:
      "El retiro me devolvió la alegría. Descubrí que no estoy sola y que Dios tiene un plan hermoso para mi vida. ¡Atrévete a vivirlo!",
  },
  {
    preferredName: "Juanda",
    firstNames: "Juan David",
    lastNames: "Gómez",
    gender: "Hombre",
    testimony:
      "Pensé que era un fin de semana más, pero cambió mi forma de ver a mi familia, a mis amigos y a Dios. Vale cada minuto.",
  },
  {
    preferredName: "Majo",
    firstNames: "María José",
    lastNames: "Herrera",
    gender: "Mujer",
    testimony:
      "Si sientes que te falta algo, ven a ITER. Allí entendí que el amor de Dios llena cualquier vacío y que servir es un regalo.",
  },
  {
    preferredName: "Nico",
    firstNames: "Nicolás",
    lastNames: "Vargas",
    gender: "Hombre",
    testimony:
      "Fui con miedo y dudas, y volví con paz. Los servidores me hicieron sentir en casa desde el primer momento. Hazlo, no te arrepentirás.",
  },
  {
    preferredName: "Vale",
    firstNames: "Valentina",
    lastNames: "Castro",
    gender: "Mujer",
    testimony:
      "ITER me enseñó a perdonar y a perdonarme. Encontré una comunidad que camina conmigo y me recuerda cada semana cuánto vale mi vida.",
  },
];

const countWords = (t: string) => t.split(/\s+/).filter(Boolean).length;

const main = async () => {
  const uri = process.env.MONGO_URI ?? "";
  const dbName = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/)?.[1] ?? "";
  if (!dbName.endsWith("_dev")) {
    throw new Error(`Por seguridad solo corre contra una base "_dev" (MONGO_URI apunta a "${dbName || "?"}").`);
  }

  await mongoose.connect(uri);
  console.log(`Conectado a ${dbName}`);

  if (process.argv.includes("--remove")) {
    const { deletedCount } = await Servidor.deleteMany({ email: { $regex: `${SEED_DOMAIN.replace(/\./g, "\\.")}$` } });
    console.log(`Eliminados ${deletedCount} servidores de prueba.`);
    return;
  }

  for (const s of SEED) {
    const words = countWords(s.testimony);
    if (words < 20 || words > 35) throw new Error(`Testimonio de ${s.preferredName} tiene ${words} palabras`);
  }

  // Contraseña aleatoria que nadie conoce: estas cuentas no son para iniciar sesión.
  const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 10);
  const last = await Servidor.findOne().sort({ registrationNumber: -1 }).select("registrationNumber").lean();
  let nextNumber = (last?.registrationNumber ?? 0) + 1;

  let created = 0;
  let updated = 0;
  for (const [i, s] of SEED.entries()) {
    const email = `testimonio${i + 1}${SEED_DOMAIN}`;
    const existing = await Servidor.findOne({ email });
    if (existing) {
      existing.testimony = s.testimony;
      existing.preferredName = s.preferredName;
      await existing.save();
      updated++;
      continue;
    }
    await Servidor.create({
      registrationNumber: nextNumber++,
      gender: s.gender,
      email,
      passwordHash,
      firstNames: s.firstNames,
      lastNames: s.lastNames,
      preferredName: s.preferredName,
      referralNamePhone: "Datos de prueba",
      documentType: "CC",
      documentNumber: `SEED-${i + 1}`,
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
      emergencyDocumentNumber: `SEED-E-${i + 1}`,
      emergencyPhone: "3000000000",
      emergencyRelation: "Otro",
      emergencyEmail: `contacto${i + 1}${SEED_DOMAIN}`,
      emergencyAddress: "Datos de prueba",
      services: ["Datos de prueba"],
      lastService: "Datos de prueba",
      serviceLeaderOf: "Ninguno",
      wentToOtherSedes: "NO",
      formationOther: "Ninguna",
      acceptTerms: true,
      acceptDataPolicy: true,
      testimony: s.testimony,
    });
    created++;
  }
  console.log(`Listo: ${created} creados, ${updated} actualizados.`);
};

main()
  .catch((error) => {
    console.error("❌", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

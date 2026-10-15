import { createApp } from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { assertEnv, env } from "./config/env.js";
import { compactRegistrationNumbers } from "./modules/users/registrationNumbers.js";
import { Soldado } from "./modules/users/soldados/soldado.model.js";
import { Servidor } from "./modules/users/servidores/servidor.model.js";

const server = async () => {
  assertEnv();
  await connectDB();
  // Corrige huecos que hayan quedado en el # de registro (p. ej. eliminaciones anteriores).
  await compactRegistrationNumbers(Soldado);
  await compactRegistrationNumbers(Servidor);

  const app = createApp();

  const port = Number(process.env.PORT ?? env.PORT ?? 5000);

  app.listen(port, "0.0.0.0", () => {
    console.log(`🚀 API running on port ${port}`);
  });
};

server().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});
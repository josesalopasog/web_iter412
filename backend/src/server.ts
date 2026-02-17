import { createApp } from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { assertEnv, env } from "./config/env.js";

const server = async () => {
  assertEnv();
  await connectDB();

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
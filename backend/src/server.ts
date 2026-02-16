import { createApp } from "./app.js";
import { connectDB } from "./db/connectDB.js";
import { assertEnv, env } from "./config/env.js";

const server = async () => {
    assertEnv();
    await connectDB();

    const app = createApp();
    app.listen(env.PORT, () => {
        console.log(`🚀 API running on http://localhost:${env.PORT}`);
    });
}

server().catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
});
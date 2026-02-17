import dotenv from "dotenv";


dotenv.config({ path: "backend/.env" });

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT ?? 5000),
    MONGO_URI: process.env.MONGO_URI ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "https://iter412.com",
};

export const assertEnv = () => {
    const missing: string[] = [];
    if (!env.MONGO_URI) missing.push("MONGO_URI");
    if (!env.JWT_SECRET) missing.push("JWT_SECRET");

    if (missing.length) {
        throw new Error(`Missing env vars: ${missing.join(", ")}`);
    }
};
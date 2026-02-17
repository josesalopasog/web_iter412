import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config({ path: "backend/.env" });

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? "development",
    PORT: Number(process.env.PORT ?? 5000),
    MONGO_URI: process.env.MONGO_URI ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d"as SignOptions["expiresIn"],
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};

export const assertEnv = () => {
    const missing: string[] = [];
    if (!env.MONGO_URI) missing.push("MONGO_URI");
    if (!env.JWT_SECRET) missing.push("JWT_SECRET");

    if (missing.length) {
        throw new Error(`Missing env vars: ${missing.join(", ")}`);
    }
};
import dotenv from "dotenv";


dotenv.config({ path: "backend/.env" });

const NODE_ENV = process.env.NODE_ENV ?? "development";

export const env = {
    NODE_ENV,
    IS_PRODUCTION: NODE_ENV === "production",
    PORT: Number(process.env.PORT ?? 5000),
    MONGO_URI: process.env.MONGO_URI ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",

    // Access token: corto, vive solo en memoria del navegador.
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m",
    // Refresh token: cookie httpOnly; define cuánto dura la sesión sin volver a iniciar sesión.
    REFRESH_TOKEN_DAYS: Number(process.env.REFRESH_TOKEN_DAYS ?? 7),

    // Cuántos proxies hay delante del backend (Render/Railway/Cloudflare...). Necesario para que
    // req.ip (y el rate limit) vea la IP real del usuario y no la del proxy.
    TRUST_PROXY_HOPS: Number(process.env.TRUST_PROXY_HOPS ?? 1),

    // Orígenes extra permitidos por CORS, separados por coma.
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "https://iter412.com",

    RESEND_API_KEY: process.env.RESEND_API_KEY ?? "",
    EMAIL_FROM: process.env.EMAIL_FROM ?? "ITER 412 <no-reply@iter412.com>",
};

export const assertEnv = () => {
    const missing: string[] = [];
    if (!env.MONGO_URI) missing.push("MONGO_URI");
    if (!env.JWT_SECRET) missing.push("JWT_SECRET");

    if (missing.length) {
        throw new Error(`Missing env vars: ${missing.join(", ")}`);
    }
};

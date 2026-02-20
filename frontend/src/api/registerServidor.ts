import type { RegistrationServidorPayload } from "../pages/Servidores/form/types";

const API_URL = import.meta.env.VITE_API_URL as string;

export async function registerServidor(payload: RegistrationServidorPayload) {
    const res = await fetch(`${API_URL}/api/servidores`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "omit",
        body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        const msg = data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data as { id: string; email: string; role: string; createdAt: string };
}
import type { Sacrament, ShirtSize } from "./types";

export const splitName = (name: string) => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length <= 1) return { firstNames: name.trim(), lastNames: "N/A" };

    return {
        firstNames: parts.slice(0, Math.max(1, parts.length - 1)).join(" "),
        lastNames: parts.slice(-1).join(" "),
    };
};

export const mapSacrament = (s: string): Sacrament => {
    const normalized = s.toLowerCase();
    if (normalized.includes("baut")) return "BAUTISMO";
    if (normalized.includes("primera")) return "PRIMERA_COMUNION";
    if (normalized.includes("confirm")) return "CONFIRMACION";
    if (normalized.includes("matrim")) return "MATRIMONIO";
    return "NINGUNO";
};

export const mapShirtSize = (size: string): ShirtSize=> {
    const up = size.trim().toUpperCase();
    if (up === "S") return "S";
    if (up === "M") return "M";
    if (up === "L") return "L";
    return "OTRO";
};

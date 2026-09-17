import type { ServidorRecord } from "../../../api/adminUsers";
import type { AppSettings } from "../../../api/settings";

export const MERCH_LABELS: Record<string, string> = {
  BUSO_CERRADO: "Buso cerrado",
  CHAQUETA_ABIERTA: "Chaqueta abierta",
  TULA: "Tula",
  GORRA: "Cachucha",
  CANGURO: "Canguro",
};

export const MERCH_ITEM_PRICE_FIELD: Record<string, keyof AppSettings> = {
  BUSO_CERRADO: "busoChaquetaPrice",
  CHAQUETA_ABIERTA: "busoChaquetaPrice",
  CANGURO: "canguroPrice",
  TULA: "tulaPrice",
  GORRA: "cachuchaPrice",
};

export const SIZED_MERCH_ITEMS = new Set(["BUSO_CERRADO", "CHAQUETA_ABIERTA"]);

export const SHIRT_COLORS = [
  { code: "BLANCA", label: "Blanca" },
  { code: "VERDE", label: "Verde" },
  { code: "AZUL", label: "Azul" },
];

export const SIZES = ["S", "M", "L"];

export const OUTER_ITEMS = [
  { code: "BUSO_CERRADO", label: "Buso cerrado" },
  { code: "CHAQUETA_ABIERTA", label: "Chaqueta abierta" },
];

export const MERCH_CATALOG: string[] = [
  ...(["Hombre", "Mujer"] as const).flatMap((gender) =>
    SHIRT_COLORS.flatMap((color) =>
      SIZES.map((size) => `CAMISETA ${gender.toUpperCase()} ${color.label.toUpperCase()} TALLA ${size}`)
    )
  ),
  ...(["Hombre", "Mujer"] as const).flatMap((gender) =>
    OUTER_ITEMS.flatMap((item) =>
      SIZES.map((size) => `${item.label.toUpperCase()} ${gender.toUpperCase()} TALLA ${size}`)
    )
  ),
  "CANGURO",
  "CACHUCHA",
  "TULAS",
];

export const isMujer = (gender?: string) => gender === "Mujer" || gender === "Femenino";
export const isHombre = (gender?: string) => gender === "Hombre" || gender === "Masculino";

export const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

export const computeMerchCatalogCounts = (rows: ServidorRecord[]): number[] => {
  const counts: number[] = [];

  for (const genderCheck of [isHombre, isMujer]) {
    const shirtList = rows.filter((r) => genderCheck(r.gender) && r.needsShirt === "SI");
    for (const color of SHIRT_COLORS) {
      for (const size of SIZES) {
        counts.push(
          shirtList.filter((r) => asStringArray(r.shirtColors).includes(color.code) && r.shirtSize === size).length
        );
      }
    }
  }

  for (const genderCheck of [isHombre, isMujer]) {
    const list = rows.filter((r) => genderCheck(r.gender));
    for (const item of OUTER_ITEMS) {
      for (const size of SIZES) {
        counts.push(
          list.filter((r) => asStringArray(r.merchItems).includes(item.code) && r.merchSize === size).length
        );
      }
    }
  }

  counts.push(rows.filter((r) => asStringArray(r.merchItems).includes("CANGURO")).length);
  counts.push(rows.filter((r) => asStringArray(r.merchItems).includes("GORRA")).length);
  counts.push(rows.filter((r) => asStringArray(r.merchItems).includes("TULA")).length);

  return counts;
};

export const computeOrderTotal = (row: ServidorRecord, settings: AppSettings): number => {
  let total = 0;
  if (row.needsShirt === "SI") {
    total += settings.shirtPrice;
    if (row.shirtSize === "OTRO") total += settings.extraSizePrice;
  }
  for (const item of asStringArray(row.merchItems)) {
    const field = MERCH_ITEM_PRICE_FIELD[item];
    if (!field) continue;
    total += settings[field];
    if (SIZED_MERCH_ITEMS.has(item) && row.merchSize === "OTRO") total += settings.extraSizePrice;
  }
  return total;
};

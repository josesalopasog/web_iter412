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
    const shirtCount = Math.max(1, asStringArray(row.shirtColors).length);
    total += settings.shirtPrice * shirtCount;
    if (row.shirtSize === "OTRO") total += settings.extraSizePrice * shirtCount;
  }
  for (const item of asStringArray(row.merchItems)) {
    const field = MERCH_ITEM_PRICE_FIELD[item];
    if (!field) continue;
    total += settings[field];
    if (SIZED_MERCH_ITEMS.has(item) && row.merchSize === "OTRO") total += settings.extraSizePrice;
  }
  return total;
};

export const MERCH_OPTIONS = [
  ...OUTER_ITEMS,
  { code: "CANGURO", label: MERCH_LABELS.CANGURO },
  { code: "TULA", label: MERCH_LABELS.TULA },
  { code: "GORRA", label: MERCH_LABELS.GORRA },
];

type EditField = (id: string, field: string, value: unknown) => Promise<void>;

// Mantiene "needsShirt" sincronizado con los colores elegidos.
export const saveShirtColors = async (row: ServidorRecord, next: string[], onEditField: EditField) => {
  const wasEmpty = asStringArray(row.shirtColors).length === 0;
  const isEmpty = next.length === 0;
  await onEditField(row._id, "shirtColors", next);
  if (wasEmpty && !isEmpty) await onEditField(row._id, "needsShirt", "SI");
  else if (!wasEmpty && isEmpty) await onEditField(row._id, "needsShirt", "NO");
};

// Al agregar un buso/chaqueta sin talla, se le asigna M por defecto.
export const saveMerchItems = async (row: ServidorRecord, next: string[], onEditField: EditField) => {
  const current = asStringArray(row.merchItems);
  const added = next.filter((item) => !current.includes(item));
  const needsDefaultSize = added.some((item) => SIZED_MERCH_ITEMS.has(item)) && !row.merchSize;

  await onEditField(row._id, "merchItems", next);
  if (needsDefaultSize) await onEditField(row._id, "merchSize", "M");
};

// Campo donde queda escrita la talla cuando la respuesta es "OTRO".
export const SIZE_OTHER_FIELD: Record<string, string> = {
  shirtSize: "shirtSizeOther",
  merchSize: "merchSizeOther",
};

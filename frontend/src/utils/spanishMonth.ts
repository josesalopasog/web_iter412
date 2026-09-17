const MONTHS_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** Spanish month name for a 1-12 month number (empty string if out of range). */
export const spanishMonthName = (month: number): string => MONTHS_ES[month - 1] ?? "";

export const formatCOP = (amount: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);

export const formatNumberCO = (amount: number): string =>
  new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(amount);

export const parseDigits = (value: string): number => Number(value.replace(/\D/g, "")) || 0;

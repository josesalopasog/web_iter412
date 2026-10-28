export type ServiceStatus = "ACTIVO" | "INACTIVO" | "SANTISIMO_NOCTURNO";
export type ServiceStatusFilterValue = ServiceStatus | "TODOS";

export const SERVICE_STATUS_LABELS: Record<ServiceStatusFilterValue, string> = {
  ACTIVO: "Activos",
  INACTIVO: "Inactivos",
  SANTISIMO_NOCTURNO: "Santísimo nocturno",
  TODOS: "Todos",
};

// Etiqueta de un servidor en la celda "Estado" (en singular).
export const SERVICE_STATUS_CELL_LABELS: Record<ServiceStatus, string> = {
  ACTIVO: "Activo",
  INACTIVO: "Inactivo",
  SANTISIMO_NOCTURNO: "Santísimo nocturno",
};

// Los servidores registrados antes de existir el campo cuentan como activos.
export const serviceStatusOf = (row: { [key: string]: unknown }): ServiceStatus =>
  row.serviceStatus === "INACTIVO" || row.serviceStatus === "SANTISIMO_NOCTURNO" ? row.serviceStatus : "ACTIVO";

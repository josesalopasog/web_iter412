export const USER_ROLES = [
  "SUPERADMIN",
  "ADMIN",
  "CM",
  "LIDER",
  "COORDINADOR",
  "SERVIDOR",
  "SOLDADO",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

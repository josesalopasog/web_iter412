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

export type CreateUserFromFormDTO = {
    // For login
    password: string; 

    // Data for the form 
    email: string;
    firstNames: string;
    lastNames: string;
    preferredName: string;
}
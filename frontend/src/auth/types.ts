export type UserRole =
  | "SUPERADMIN"
  | "ADMIN"
  | "CM"
  | "LIDER"
  | "COORDINADOR"
  | "SERVIDOR"
  | "SOLDADO";

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
  firstNames: string;
  lastNames: string;
  preferredName: string;
};

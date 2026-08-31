import type { UserRole } from "../modules/users/roles.js";

export type AuthUser = {
  sub: string;
  email: string;
  role: UserRole;
  firstNames: string;
  lastNames: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

import { Log } from "./log.model.js";
import type { AuthUser } from "../../types/express.js";

export const createLog = async (user: AuthUser, action: string, summary: string) => {
  try {
    await Log.create({
      userId: user.sub,
      userName: `${user.firstNames} ${user.lastNames}`,
      userRole: user.role,
      action,
      summary,
    });
  } catch (error) {
    console.error("Failed to write log entry:", error);
  }
};

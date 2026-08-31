import { asyncHandler } from "../../utils/asyncHandler.js";
import { Log } from "./log.model.js";

export const listLogs = asyncHandler(async (_req, res) => {
  const logs = await Log.find().sort({ createdAt: -1 }).limit(500);
  res.json(logs);
});

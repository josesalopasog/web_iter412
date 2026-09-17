import { Settings } from "./settings.model.js";

export const getSettings = async () => {
  const existing = await Settings.findOne();
  if (existing) return existing;
  return Settings.create({});
};

export type SettingsDoc = Awaited<ReturnType<typeof getSettings>>;

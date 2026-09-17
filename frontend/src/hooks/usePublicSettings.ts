import { useEffect, useState } from "react";
import { getPublicSettings } from "../api/settings";
import type { PublicSettings } from "../api/settings";

const FALLBACK_SETTINGS: PublicSettings = {
  soldadoPrice: 435000,
  servidorPrice: 300000,
  fridayDate: 13,
  saturdayDate: 14,
  sundayDate: 15,
  retreatMonth: 11,
  retreatYear: 2026,
  advanceStartDay: 1,
  advanceEndDay: 15,
  advanceMonth: 10,
  finalPaymentStartDay: 1,
  finalPaymentEndDay: 7,
  finalPaymentMonth: 11,
};

/** Retreat price/date values shown on public pages (registration forms, home). */
export const usePublicSettings = (): PublicSettings => {
  const [settings, setSettings] = useState<PublicSettings>(FALLBACK_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    getPublicSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        // keep the fallback values if the request fails
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
};

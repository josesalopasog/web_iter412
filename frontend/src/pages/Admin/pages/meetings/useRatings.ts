import { useEffect, useMemo, useState } from "react";
import { getRatingsSummary } from "../../../../api/events";
import type { EventRecord, RatingSummary } from "../../../../api/events";
import { buildExampleRatings } from "./exampleRatings";

/**
 * Calificaciones de las reuniones para el dashboard. Si todavía nadie ha calificado, se muestran
 * datos de ejemplo (isExample = true) para que se vea cómo quedará el análisis.
 */
export const useRatings = (events: EventRecord[], today: string) => {
  const [real, setReal] = useState<RatingSummary[] | null>(null);

  useEffect(() => {
    getRatingsSummary()
      .then((data) => setReal(data.events))
      .catch(() => setReal([]));
  }, []);

  return useMemo(() => {
    if (real && real.length > 0) return { ratings: real, isExample: false, isLoading: false };
    return { ratings: buildExampleRatings(events, today), isExample: true, isLoading: real === null };
  }, [real, events, today]);
};

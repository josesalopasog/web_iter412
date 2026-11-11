import { useCallback, useEffect, useState } from "react";
import { listVoice, updateVoiceStatus } from "../../../../api/voice";
import type { VoiceEntry, VoiceStatus } from "../../../../api/voice";

/** Respuestas de "Tu voz en ITER" para el dashboard, con el cambio de estado. */
export const useVoice = () => {
  const [entries, setEntries] = useState<VoiceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listVoice()
      .then(setEntries)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "No se pudieron cargar las respuestas"))
      .finally(() => setIsLoading(false));
  }, []);

  const setStatus = useCallback(async (id: string, status: VoiceStatus) => {
    const updated = await updateVoiceStatus(id, status);
    setEntries((prev) => prev.map((e) => (e._id === id ? { ...e, status: updated.status } : e)));
  }, []);

  return { entries, isLoading, error, setStatus };
};

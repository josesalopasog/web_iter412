import { useEffect, useState } from "react";

type ReportState<T> = { range: number; data: T | null; error: string | null };

/** Pide un reporte del dashboard (resumen, analítica, finanzas) y lo vuelve a pedir al cambiar el periodo. */
export const useReport = <T,>(load: (range: number) => Promise<T>, range: number) => {
  const [state, setState] = useState<ReportState<T> | null>(null);

  useEffect(() => {
    let cancelled = false;
    load(range)
      .then((data) => {
        if (!cancelled) setState({ range, data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState((prev) => ({
            range,
            data: prev?.data ?? null,
            error: err instanceof Error ? err.message : "No se pudieron cargar los datos",
          }));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [load, range]);

  const data = state?.data ?? null;
  const isPending = state?.range !== range;
  // Mientras cambia el periodo se sigue mostrando el anterior (sin parpadeo).
  return {
    data,
    error: data ? null : (state?.error ?? null),
    isLoading: isPending && !data,
    isRefreshing: isPending && Boolean(data),
  };
};

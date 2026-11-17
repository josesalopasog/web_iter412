import { authedRequest } from "./http";
import type { ServidorRecord, SoldadoRecord } from "./adminUsers";

// Cierre del retiro y copias de los retiros anteriores.
export type RetreatArchiveTotals = {
  participantes: number;
  hombres: number;
  mujeres: number;
  servidores: number;
  servidoresActivos: number;
  soldadosPagado: number;
  soldadosSubsidio: number;
  servidoresPagado: number;
  servidoresSubsidio: number;
  inscripcionesPendientes: number;
};

export type RetreatArchiveSummary = {
  _id: string;
  retreatNumber: number;
  retreatYear: number;
  retreatMonth: number;
  totals: RetreatArchiveTotals;
  finishedBy?: { firstNames?: string; lastNames?: string };
  createdAt: string;
};

export type RetreatArchive = RetreatArchiveSummary & {
  settings: Record<string, unknown>;
  participantes: SoldadoRecord[];
  servidores: ServidorRecord[];
};

export const finishRetreat = (confirmNumber: number) =>
  authedRequest<{ ok: true; retreatNumber: number }>("/api/retreats/finish", {
    method: "POST",
    body: JSON.stringify({ confirmNumber }),
  });

export const listRetreatArchives = () => authedRequest<RetreatArchiveSummary[]>("/api/retreats/archives");

export const getRetreatArchive = (id: string) => authedRequest<RetreatArchive>(`/api/retreats/archives/${id}`);

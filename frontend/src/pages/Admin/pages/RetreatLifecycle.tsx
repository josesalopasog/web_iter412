import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { updateServiceSignup } from "../../../api/settings";
import { finishRetreat, getRetreatArchive, listRetreatArchives } from "../../../api/retreats";
import type { RetreatArchiveSummary } from "../../../api/retreats";
import type { SoldadoRecord } from "../../../api/adminUsers";
import { downloadXlsx } from "../../Dashboard/ui/exportXlsx";
import { toRoman } from "../../../utils/romanNumeral";
import { spanishMonthName } from "../../../utils/spanishMonth";
import { useAdminData } from "../AdminData";
import { formatCOP, formatNumber } from "../format";
import { DownloadIcon } from "../icons";

const fullName = (r: Record<string, unknown>) => `${r.firstNames ?? ""} ${r.lastNames ?? ""}`.trim();

/**
 * Debajo de los ajustes del retiro: interruptor de "Activo para servir" en el perfil, botón para
 * finalizar el retiro actual y la lista de retiros anteriores (copias que se pueden descargar).
 */
const RetreatLifecycle = () => {
  const { user } = useAuth();
  const data = useAdminData();
  const canToggle = user?.role === "SUPERADMIN" || user?.role === "TREASURER";
  const canFinish = user?.role === "SUPERADMIN";
  const number = data.settings.retreatNumber;
  const roman = toRoman(number);

  const soldados = data.soldados as SoldadoRecord[];
  const participantes = soldados.filter((s) => s.attended).length;
  const pendientes = soldados.length - participantes;

  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [finishedMsg, setFinishedMsg] = useState<string | null>(null);
  const [archives, setArchives] = useState<RetreatArchiveSummary[] | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const loadArchives = () =>
    listRetreatArchives()
      .then(setArchives)
      .catch(() => setArchives([]));

  useEffect(() => {
    loadArchives();
  }, []);

  const toggleSignup = async () => {
    setToggling(true);
    setToggleError(null);
    try {
      const updated = await updateServiceSignup(!data.serviceSignupOpen);
      data.setServiceSignupOpen(updated.serviceSignupOpen);
    } catch (err) {
      setToggleError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setToggling(false);
    }
  };

  const confirmFinish = async () => {
    setFinishing(true);
    setFinishError(null);
    try {
      await finishRetreat(number);
      setConfirmOpen(false);
      setTyped("");
      setFinishedMsg(
        `El ${roman} retiro quedó guardado en "Retiros anteriores". Ahora estás en el ${toRoman(number + 1)} retiro.`
      );
      await Promise.all([data.reload(), loadArchives()]);
    } catch (err) {
      setFinishError(err instanceof Error ? err.message : "No se pudo finalizar el retiro");
    } finally {
      setFinishing(false);
    }
  };

  const downloadArchive = async (a: RetreatArchiveSummary) => {
    setDownloading(a._id);
    try {
      const full = await getRetreatArchive(a._id);
      const headers = ["#", "Nombre", "Género", "Documento", "Teléfono", "Correo", "Ciudad", "Pagado", "Subsidio"];
      const rows = full.participantes.map((p) => [
        String(p.registrationNumber ?? ""),
        fullName(p as unknown as Record<string, unknown>),
        String(p.gender ?? ""),
        String(p.documentNumber ?? ""),
        String(p.phone ?? ""),
        String((p as unknown as Record<string, unknown>).email ?? ""),
        String(p.city ?? ""),
        formatCOP(Number(p.paymentAmount) || 0),
        formatCOP(Number(p.subsidyAmount) || 0),
      ]);
      downloadXlsx(`retiro-${toRoman(a.retreatNumber)}-participantes.xlsx`, "Participantes", headers, rows);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <div className="pageGrid pageGridHalf">
        <div className="chartCard lifecycleCard">
          <div className="chartCardHeader">
            <div>
              <h2 className="chartCardTitle">Disponibilidad de los servidores</h2>
              <p className="chartCardSubtitle">
                Controla si en el perfil se puede encender <strong>Activo para servir</strong>.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={data.serviceSignupOpen}
            className={`adSwitch${data.serviceSignupOpen ? " is-on" : ""}`}
            disabled={!canToggle || toggling}
            onClick={toggleSignup}
          >
            <span className="adSwitchKnob" aria-hidden="true" />
            <span>Permitir que los servidores se activen para servir</span>
          </button>
          <p className="lifecycleHint">
            {data.serviceSignupOpen
              ? "Abierto: cada servidor puede activarse o desactivarse desde su perfil."
              : `Bloqueado: en el perfil la casilla aparece deshabilitada con el aviso "Pronto podrás activarte para servir en el próximo retiro".`}
          </p>
          {!canToggle && <p className="lifecycleHint">Solo un SUPERADMIN o TESORERO puede cambiarlo.</p>}
          {toggleError && <p className="loginError">{toggleError}</p>}
        </div>

        <div className="chartCard lifecycleCard lifecycleDanger">
          <div className="chartCardHeader">
            <div>
              <h2 className="chartCardTitle">Finalizar el {roman} retiro</h2>
              <p className="chartCardSubtitle">Guarda una copia del retiro y deja todo listo para el siguiente.</p>
            </div>
          </div>
          <ul className="lifecycleList">
            <li>
              <strong>{formatNumber(participantes)}</strong> participantes se archivan y la tabla de Participantes queda en 0.
            </li>
            <li>
              <strong>{formatNumber(pendientes)}</strong> inscripciones de soldados que no asistieron se mantienen.
            </li>
            <li>
              <strong>{formatNumber(data.servidores.length)}</strong> servidores pasan a inactivo y su pago del retiro vuelve a $0.
            </li>
            <li>Se bloquea "Activo para servir" en el perfil y el número del retiro pasa a {toRoman(number + 1)}.</li>
            <li>No cambia reuniones, merch, Tu voz en ITER ni nada que no sea del retiro.</li>
          </ul>
          {finishedMsg && <p className="lifecycleOk">{finishedMsg}</p>}
          <div className="lifecycleActions">
            {canFinish ? (
              <button type="button" className="btnDanger" onClick={() => setConfirmOpen(true)}>
                Finalizar {roman} retiro
              </button>
            ) : (
              <p className="lifecycleHint">Solo un SUPERADMIN puede finalizar el retiro.</p>
            )}
          </div>
        </div>
      </div>

      <div className="chartCard">
        <div className="chartCardHeader">
          <div>
            <h2 className="chartCardTitle">Retiros anteriores</h2>
            <p className="chartCardSubtitle">Copias guardadas al finalizar cada retiro.</p>
          </div>
        </div>
        {archives === null ? (
          <p className="pageEmpty">Cargando…</p>
        ) : archives.length === 0 ? (
          <p className="pageEmpty">Aún no se ha finalizado ningún retiro desde el dashboard.</p>
        ) : (
          <ul className="miniList">
            {archives.map((a) => (
              <li key={a._id}>
                <span className="miniListMain">
                  <span className="miniListTitle">
                    Retiro {toRoman(a.retreatNumber)} · {spanishMonthName(a.retreatMonth)} {a.retreatYear}
                  </span>
                  <span className="miniListMeta">
                    {formatNumber(a.totals.participantes)} participantes ({formatNumber(a.totals.hombres)} H ·{" "}
                    {formatNumber(a.totals.mujeres)} M) · {formatNumber(a.totals.servidoresActivos)} servidores activos ·
                    recaudado {formatCOP(a.totals.soldadosPagado + a.totals.servidoresPagado)} · finalizado el{" "}
                    {new Date(a.createdAt).toLocaleDateString("es-CO")}
                    {a.finishedBy?.firstNames ? ` por ${a.finishedBy.firstNames} ${a.finishedBy.lastNames ?? ""}` : ""}
                  </span>
                </span>
                <button
                  type="button"
                  className="toolbarButton"
                  disabled={downloading === a._id}
                  onClick={() => downloadArchive(a)}
                >
                  <DownloadIcon /> Participantes
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {confirmOpen && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalHead">
              <h3>⚠️ Finalizar el {roman} retiro</h3>
              <button type="button" className="modalClose" onClick={() => setConfirmOpen(false)} disabled={finishing}>
                ✕
              </button>
            </div>
            <div className="modalBody" style={{ whiteSpace: "normal" }}>
              <p>
                Se guardará una copia y luego se archivarán <strong>{formatNumber(participantes)} participantes</strong>,
                los <strong>{formatNumber(data.servidores.length)} servidores</strong> quedarán inactivos y se bloqueará
                "Activo para servir". Esto no se puede deshacer desde el dashboard.
              </p>
              <label className="lifecycleConfirm">
                Escribe <strong>{number}</strong> para confirmar
                <input
                  className="formInput"
                  inputMode="numeric"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value.replace(/\D/g, ""))}
                  autoFocus
                />
              </label>
              {finishError && <p className="loginError">{finishError}</p>}
            </div>
            <div className="modalActions">
              <button type="button" className="btnGhost" onClick={() => setConfirmOpen(false)} disabled={finishing}>
                Cancelar
              </button>
              <button
                type="button"
                className="btnDanger"
                onClick={confirmFinish}
                disabled={finishing || Number(typed) !== number}
              >
                {finishing ? "Finalizando…" : `Finalizar ${roman} retiro`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RetreatLifecycle;

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  VOICE_SPACE_LABELS,
  VOICE_STATUS_LABELS,
  VOICE_TARGET_LABELS,
  VOICE_TYPE_LABELS,
  VOICE_VISIBILITY_LABELS,
} from "../../../../api/voice";
import type { VoiceEntry, VoiceStatus } from "../../../../api/voice";
import { PageLoader } from "../../../../components/Spinner";
import { ChartCard } from "../../ui/Charts";
import { COLORS } from "../../ui/colors";
import DataTable, { type DataColumn } from "../../ui/DataTable";
import { PageHeading } from "../../ui/PageParts";
import { ChartBarIcon } from "../../icons";
import { formatDateTime } from "../../format";
import { useVoice } from "./useVoice";

const STATUS_CLASS: Record<VoiceStatus, string> = { NUEVO: "sinPago", LEIDO: "info", ATENDIDO: "completo" };

const detailOf = (e: VoiceEntry) =>
  e.type === "SUGERENCIA"
    ? e.target
      ? `Para: ${VOICE_TARGET_LABELS[e.target]}`
      : "Sin destino"
    : e.type === "ACTIVIDAD"
      ? e.space
        ? VOICE_SPACE_LABELS[e.space]
        : ""
      : e.visibility
        ? `Lo ven: ${VOICE_VISIBILITY_LABELS[e.visibility]}`
        : "";

// Respuestas de "Tu voz en ITER": leerlas y marcarlas como leídas o atendidas.
const VoiceResponses = () => {
  const { entries, isLoading, error, setStatus } = useVoice();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const changeStatus = async (id: string, status: VoiceStatus) => {
    setSavingId(id);
    setActionError(null);
    try {
      await setStatus(id, status);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : "No se pudo cambiar el estado");
    } finally {
      setSavingId(null);
    }
  };

  const columns: DataColumn<VoiceEntry>[] = [
    { key: "date", label: "Fecha", className: "cellMuted", render: (e) => formatDateTime(e.createdAt), value: (e) => formatDateTime(e.createdAt) },
    {
      key: "type",
      label: "Tipo",
      render: (e) => <span className={`typeTag ${e.type === "ORACION" ? "soldados" : "info"}`}>{VOICE_TYPE_LABELS[e.type]}</span>,
      value: (e) => VOICE_TYPE_LABELS[e.type],
    },
    {
      key: "from",
      label: "De",
      render: (e) => (e.anonymous ? <span className="statusPill neutral">Anónimo</span> : e.userName ?? "-"),
      value: (e) => (e.anonymous ? "Anónimo" : e.userName ?? ""),
    },
    { key: "detail", label: "Detalle", className: "cellMuted", render: detailOf, value: detailOf },
    { key: "topic", label: "Tema", className: "cellStrong", render: (e) => e.topic || "-", value: (e) => e.topic },
    { key: "text", label: "Mensaje", className: "cellWrap voiceMessageCell", render: (e) => e.text, value: (e) => e.text },
    {
      key: "status",
      label: "Estado",
      render: (e) => <span className={`statusPill ${STATUS_CLASS[e.status]}`}>{VOICE_STATUS_LABELS[e.status]}</span>,
      value: (e) => VOICE_STATUS_LABELS[e.status],
    },
  ];

  if (isLoading) return <PageLoader variant="inline" label="Cargando respuestas" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Tu voz en ITER" }, { label: "Respuestas" }]}
        title="Respuestas de Tu voz en ITER"
        subtitle="Las peticiones de oración marcadas como «Solo el comité» son confidenciales."
      >
        <Link to="/dashboard/tu-voz" className="toolbarButton">
          <ChartBarIcon /> Ver análisis
        </Link>
      </PageHeading>

      {(error || actionError) && <p className="eventErrorMsg">{error ?? actionError}</p>}

      <ChartCard title="Mensajes" subtitle={`${entries.length} en total`}>
        <DataTable
          id="tu-voz-respuestas"
          rows={entries}
          columns={columns}
          getRowId={(e) => e._id}
          tabs={[
            { value: "nuevos", label: "Nuevos", match: (e) => e.status === "NUEVO", dot: COLORS.negativo },
            { value: "SUGERENCIA", label: "Sugerencias", match: (e) => e.type === "SUGERENCIA", dot: COLORS.info },
            { value: "ACTIVIDAD", label: "Actividades", match: (e) => e.type === "ACTIVIDAD", dot: COLORS.info2 },
            { value: "ORACION", label: "Oración", match: (e) => e.type === "ORACION", dot: COLORS.todos },
            { value: "todos", label: "Todos" },
          ]}
          searchPlaceholder="Buscar por tema, mensaje o nombre"
          emptyText="Aún no hay mensajes."
          actions={(e) => (
            <span className="tableRowActions">
              {e.status !== "LEIDO" && (
                <button type="button" className="toolbarButton" disabled={savingId === e._id} onClick={() => changeStatus(e._id, "LEIDO")}>
                  Leído
                </button>
              )}
              {e.status !== "ATENDIDO" && (
                <button type="button" className="toolbarButton" disabled={savingId === e._id} onClick={() => changeStatus(e._id, "ATENDIDO")}>
                  Atendido
                </button>
              )}
              {e.status !== "NUEVO" && (
                <button type="button" className="toolbarButton" disabled={savingId === e._id} onClick={() => changeStatus(e._id, "NUEVO")}>
                  Marcar nuevo
                </button>
              )}
            </span>
          )}
        />
      </ChartCard>
    </div>
  );
};

export default VoiceResponses;

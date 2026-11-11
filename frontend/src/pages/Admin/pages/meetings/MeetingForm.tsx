import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { createEvent, updateEvent } from "../../../../api/events";
import type { EventInput } from "../../../../api/events";
import { PageLoader } from "../../../../components/Spinner";
import EventForm from "../../../ManageSchedule/ui/EventForm";
import { ChartCard } from "../../ui/Charts";
import { PageHeading } from "../../ui/PageParts";
import { ClipboardIcon } from "../../icons";
import { useEvents } from "./useEvents";
import "../../../ManageSchedule/styles.css";

// Agregar un evento al cronograma (o editar uno, en /dashboard/reuniones/evento/:id).
const MeetingForm = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const defaultDate = params.get("fecha") ?? undefined;
  const navigate = useNavigate();
  const { events, isLoading } = useEvents();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const editing = id ? (events.find((e) => e._id === id) ?? null) : null;

  const handleSubmit = async (payload: EventInput) => {
    setIsSaving(true);
    setError(null);
    setSaved(null);
    try {
      if (editing) {
        await updateEvent(editing._id, payload);
        navigate("/dashboard/reuniones/tabla");
      } else {
        const created = await createEvent(payload);
        setSaved(`Se agregó "${created.title}" al cronograma.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error guardando el evento");
    } finally {
      setIsSaving(false);
    }
  };

  if (id && isLoading) return <PageLoader variant="inline" label="Cargando evento" />;

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Reuniones", to: "/dashboard/reuniones" },
          { label: editing ? "Editar evento" : "Agregar evento" },
        ]}
        title={editing ? "Editar evento" : "Agregar evento"}
        subtitle="Las reuniones abiertas se muestran en el cronograma de la página principal."
      >
        <Link to="/dashboard/reuniones/tabla" className="toolbarButton">
          <ClipboardIcon /> Ver cronograma
        </Link>
      </PageHeading>

      {id && !editing && <p className="eventErrorMsg">No se encontró el evento.</p>}
      {error && <p className="eventErrorMsg">{error}</p>}
      {saved && (
        <p className="formSuccess">
          {saved} <Link to="/dashboard/reuniones/tabla">Ver cronograma →</Link>
        </p>
      )}

      {(!id || editing) && (
        <ChartCard title={editing ? editing.title : "Nuevo evento"} subtitle="Título, fecha, hora, lugar y etiqueta">
          <EventForm
            key={editing?._id ?? "nuevo"}
            editingEvent={editing}
            defaultDate={defaultDate}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancelEdit={() => navigate("/dashboard/reuniones/tabla")}
          />
        </ChartCard>
      )}
    </div>
  );
};

export default MeetingForm;

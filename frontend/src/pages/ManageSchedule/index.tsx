import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoLink from "../../components/LogoLink";
import PageLoader from "../../components/Spinner";
import ConfirmLogoutModal from "../../components/ConfirmLogoutModal";
import { useAuth } from "../../auth/AuthContext";
import { UserIcon, LogoutIcon, TrashIcon } from "../../assets/icons";
import { listEvents, createEvent, updateEvent, deleteEvent } from "../../api/events";
import type { EventRecord, EventInput } from "../../api/events";
import EventForm from "./ui/EventForm";
import EventStatsCards from "./ui/EventStatsCards";
import ConfirmDeleteEventModal from "./ui/ConfirmDeleteEventModal";
import "../Dashboard/styles.css";
import "./styles.css";

const formatDate = (iso: string) => {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const formatRange = (event: EventRecord) => {
  const dateLabel = event.endDateISO ? `${formatDate(event.dateISO)} - ${formatDate(event.endDateISO)}` : formatDate(event.dateISO);
  const timeLabel = event.start ? `${event.start}${event.end ? ` - ${event.end}` : ""}` : "-";
  return { dateLabel, timeLabel };
};

const ManageSchedule = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventRecord | null>(null);
  const [deletingEvent, setDeletingEvent] = useState<EventRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadEvents = () =>
    listEvents()
      .then(setEvents)
      .catch((error: unknown) => setErrorMsg(error instanceof Error ? error.message : "Error cargando el cronograma"))
      .finally(() => setIsLoading(false));

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSubmit = async (payload: EventInput) => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      if (editingEvent) {
        const updated = await updateEvent(editingEvent._id, payload);
        setEvents((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
        setEditingEvent(null);
      } else {
        const created = await createEvent(payload);
        setEvents((prev) => [...prev, created]);
      }
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error guardando el evento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setIsDeleting(true);
    try {
      await deleteEvent(deletingEvent._id);
      setEvents((prev) => prev.filter((e) => e._id !== deletingEvent._id));
      setDeletingEvent(null);
      if (editingEvent?._id === deletingEvent._id) setEditingEvent(null);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error eliminando el evento");
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.dateISO.localeCompare(b.dateISO) || (a.start ?? "").localeCompare(b.start ?? ""));

  return (
    <div className="dashboardPage">
      <header className="dashboardHeader">
        <div className="dashboardHeaderLeft">
          <LogoLink className="dashboardLogo" />
          <div className="dashboardTitle">
            <h1>Cronograma de Reuniones</h1>
          </div>
        </div>

        <div className="dashboardHeaderRight">
          <button type="button" className="eventBtnGhost" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button className="iconBtn" type="button" title="Mi perfil" onClick={() => navigate("/profile")}>
            <UserIcon className="w-5 h-5" />
          </button>
          <button className="iconBtn" type="button" title="Cerrar sesión" onClick={() => setShowLogoutConfirm(true)}>
            <LogoutIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="dashboardBody">
        <h2 className="eventsPageTitle">Dashboard de eventos</h2>

        {errorMsg && <p className="eventErrorMsg">{errorMsg}</p>}

        <EventStatsCards events={events} />

        <div className="tableSection">
          <EventForm
            key={editingEvent?._id ?? "new"}
            editingEvent={editingEvent}
            isSaving={isSaving}
            onSubmit={handleSubmit}
            onCancelEdit={() => setEditingEvent(null)}
          />
        </div>

        {isLoading ? (
          <PageLoader variant="inline" label="Cargando eventos" />
        ) : (
          <div className="tableSection eventsTableSection">
            <div className="tableScroll">
              <table className="dataTable">
                <thead>
                  <tr>
                    <th></th>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Etiqueta</th>
                    <th>Abierta</th>
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEvents.length === 0 ? (
                    <tr>
                      <td className="emptyState" colSpan={7}>
                        No hay eventos próximos. Agrega el primero arriba.
                      </td>
                    </tr>
                  ) : (
                    sortedEvents.map((event) => {
                      const { dateLabel, timeLabel } = formatRange(event);
                      return (
                        <tr
                          key={event._id}
                          className="eventRow"
                          title="Doble clic para editar"
                          onDoubleClick={() => setEditingEvent(event)}
                        >
                          <td>
                            <button
                              type="button"
                              className="rowDeleteBtn"
                              title="Eliminar"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingEvent(event);
                              }}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </td>
                          <td>{event.title}</td>
                          <td>{dateLabel}</td>
                          <td>{timeLabel}</td>
                          <td>{event.tag ?? "-"}</td>
                          <td>{event.isOpen ? "Sí" : "No"}</td>
                          <td>{event.location || "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {deletingEvent && (
        <ConfirmDeleteEventModal
          title={deletingEvent.title}
          isDeleting={isDeleting}
          onCancel={() => setDeletingEvent(null)}
          onConfirm={handleDelete}
        />
      )}

      {showLogoutConfirm && <ConfirmLogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={logout} />}
    </div>
  );
};

export default ManageSchedule;

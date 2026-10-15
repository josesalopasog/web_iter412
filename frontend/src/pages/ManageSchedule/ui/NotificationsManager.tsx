import { useEffect, useState } from "react";
import PageLoader from "../../../components/Spinner";
import { TrashIcon } from "../../../assets/icons";
import {
  listCustomNotifications,
  createCustomNotification,
  deleteCustomNotification,
} from "../../../api/notifications";
import type { CustomNotificationRecord } from "../../../api/notifications";

const DEFAULT_DAYS = 30;
const MAX_TITLE = 80;
const MAX_BODY = 300;

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
};

const formatExpiry = (n: CustomNotificationRecord) => {
  if (!n.expiresAt) return "Siempre";
  const daysLeft = Math.max(0, Math.ceil((new Date(n.expiresAt).getTime() - Date.now()) / 86_400_000));
  return `${formatDate(n.expiresAt)} (${daysLeft === 1 ? "1 día" : `${daysLeft} días`})`;
};

// "Administrar notificaciones": los admins publican avisos que les llegan a todos en la campana.
// Duran 30 días por defecto (al vencer se eliminan solos) o se pueden dejar para siempre.
const NotificationsManager = () => {
  const [items, setItems] = useState<CustomNotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleting, setDeleting] = useState<CustomNotificationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [days, setDays] = useState(String(DEFAULT_DAYS));
  const [forever, setForever] = useState(false);

  useEffect(() => {
    listCustomNotifications()
      .then(setItems)
      .catch((error: unknown) =>
        setErrorMsg(error instanceof Error ? error.message : "Error cargando las notificaciones")
      )
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const created = await createCustomNotification({
        title,
        body,
        durationDays: forever ? null : Number(days),
      });
      setItems((prev) => [created, ...prev]);
      setTitle("");
      setBody("");
      setDays(String(DEFAULT_DAYS));
      setForever(false);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error publicando la notificación");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteCustomNotification(deleting._id);
      setItems((prev) => prev.filter((n) => n._id !== deleting._id));
      setDeleting(null);
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : "Error eliminando la notificación");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="notifManager">
      <h2 className="eventsPageTitle">Administrar notificaciones</h2>

      {errorMsg && <p className="eventErrorMsg">{errorMsg}</p>}

      <div className="tableSection">
        <form className="eventForm" onSubmit={handleSubmit}>
          <div className="eventFormGrid">
            <label className="configField eventFormFieldWide">
              <span>Título</span>
              <input
                className="configInputPlain"
                type="text"
                required
                maxLength={MAX_TITLE}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>

            <label className="configField eventFormFieldWide">
              <span>Mensaje</span>
              <textarea
                className="configInputPlain eventFormTextarea"
                required
                maxLength={MAX_BODY}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>

            <label className="configField">
              <span>Mostrar durante (días)</span>
              <input
                className="configInputPlain"
                type="number"
                min={1}
                max={365}
                step={1}
                required={!forever}
                disabled={forever}
                value={forever ? "" : days}
                placeholder={forever ? "Siempre" : undefined}
                onChange={(e) => setDays(e.target.value)}
              />
            </label>

            <label className="configField eventFormCheckbox">
              <span>Mostrar siempre (hasta que se elimine)</span>
              <input type="checkbox" checked={forever} onChange={(e) => setForever(e.target.checked)} />
            </label>
          </div>

          <div className="eventFormActions">
            <button type="submit" className="eventBtnPrimary" disabled={isSaving}>
              {isSaving ? "Publicando..." : "Publicar notificación"}
            </button>
          </div>
        </form>
      </div>

      {isLoading ? (
        <PageLoader variant="inline" label="Cargando notificaciones" />
      ) : (
        <div className="tableSection eventsTableSection">
          <div className="tableScroll">
            <table className="dataTable">
              <thead>
                <tr>
                  <th></th>
                  <th>Título</th>
                  <th>Mensaje</th>
                  <th>Publicada</th>
                  <th>Visible hasta</th>
                  <th>Publicada por</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="emptyState" colSpan={6}>
                      No hay notificaciones activas. Publica la primera arriba.
                    </td>
                  </tr>
                ) : (
                  items.map((n) => (
                    <tr key={n._id}>
                      <td>
                        <button
                          type="button"
                          className="rowDeleteBtn"
                          title="Eliminar"
                          onClick={() => setDeleting(n)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </td>
                      <td>{n.title}</td>
                      <td className="notifManagerBody" title={n.body}>
                        {n.body}
                      </td>
                      <td>{formatDate(n.createdAt)}</td>
                      <td>{formatExpiry(n)}</td>
                      <td>{n.createdBy || "-"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleting && (
        <div className="modalOverlay deleteOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalHead">
              <h3>🗑️ Eliminar notificación</h3>
              <button type="button" className="modalClose" onClick={() => setDeleting(null)}>
                ✕
              </button>
            </div>
            <div className="modalBody" style={{ whiteSpace: "normal" }}>
              <p>
                ¿Seguro que deseas eliminar la notificación <strong>{deleting.title}</strong>? Dejará de
                aparecerle a todos.
              </p>
              <p>Esta acción no se puede deshacer.</p>
            </div>
            <div className="modalActions">
              <button
                type="button"
                className="eventBtnGhost"
                onClick={() => setDeleting(null)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button type="button" className="btnDanger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsManager;

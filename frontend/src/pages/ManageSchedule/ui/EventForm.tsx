import { useState } from "react";
import type { EventInput, EventRecord, EventTag } from "../../../api/events";

const TAGS: EventTag[] = ["Reunión", "Retiro", "Formación", "Otro"];

const todayISO = () => new Date().toISOString().slice(0, 10);

const emptyForm: EventInput = {
  title: "",
  dateISO: "",
  start: "",
  end: "",
  endDateISO: "",
  location: "",
  tag: "Reunión",
  description: "",
  isOpen: true,
};

type Props = {
  editingEvent: EventRecord | null;
  isSaving: boolean;
  onSubmit: (payload: EventInput) => void;
  onCancelEdit: () => void;
};

const EventForm: React.FC<Props> = ({ editingEvent, isSaving, onSubmit, onCancelEdit }) => {
  const [form, setForm] = useState<EventInput>(
    editingEvent
      ? {
          title: editingEvent.title,
          dateISO: editingEvent.dateISO,
          start: editingEvent.start ?? "",
          end: editingEvent.end ?? "",
          endDateISO: editingEvent.endDateISO ?? "",
          location: editingEvent.location ?? "",
          tag: editingEvent.tag ?? "Reunión",
          description: editingEvent.description ?? "",
          isOpen: Boolean(editingEvent.isOpen),
        }
      : emptyForm
  );

  const field = <K extends keyof EventInput>(key: K, value: EventInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
    if (!editingEvent) setForm(emptyForm);
  };

  return (
    <form className="eventForm" onSubmit={handleSubmit}>
      <div className="eventFormGrid">
        <label className="configField eventFormFieldWide">
          <span>Título</span>
          <input
            className="configInputPlain"
            type="text"
            required
            value={form.title}
            onChange={(e) => field("title", e.target.value)}
          />
        </label>

        <label className="configField">
          <span>Etiqueta</span>
          <select
            className="configInputPlain"
            value={form.tag}
            onChange={(e) => field("tag", e.target.value as EventTag)}
          >
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="configField eventFormCheckbox">
          <span>Reunión cerrada</span>
          <input
            type="checkbox"
            checked={!form.isOpen}
            onChange={(e) => field("isOpen", !e.target.checked)}
          />
        </label>

        <label className="configField">
          <span>Fecha</span>
          <input
            className="configInputPlain"
            type="date"
            required
            min={todayISO()}
            value={form.dateISO}
            onChange={(e) => field("dateISO", e.target.value)}
          />
        </label>

        <label className="configField">
          <span>Hora inicio</span>
          <input
            className="configInputPlain"
            type="time"
            value={form.start}
            onChange={(e) => field("start", e.target.value)}
          />
        </label>

        <label className="configField">
          <span>Fecha fin (si dura varios días)</span>
          <input
            className="configInputPlain"
            type="date"
            min={form.dateISO > todayISO() ? form.dateISO : todayISO()}
            value={form.endDateISO}
            onChange={(e) => field("endDateISO", e.target.value)}
          />
        </label>

        <label className="configField">
          <span>Hora fin</span>
          <input
            className="configInputPlain"
            type="time"
            value={form.end}
            onChange={(e) => field("end", e.target.value)}
          />
        </label>

        <label className="configField eventFormFieldWide">
          <span>Ubicación</span>
          <input
            className="configInputPlain"
            type="text"
            value={form.location}
            onChange={(e) => field("location", e.target.value)}
          />
        </label>

        <label className="configField eventFormFieldWide">
          <span>Descripción</span>
          <textarea
            className="configInputPlain eventFormTextarea"
            value={form.description}
            onChange={(e) => field("description", e.target.value)}
          />
        </label>
      </div>

      <div className="eventFormActions">
        <button type="submit" className="eventBtnPrimary" disabled={isSaving}>
          {isSaving ? "Guardando..." : editingEvent ? "Guardar cambios" : "Agregar evento"}
        </button>
        {editingEvent && (
          <button type="button" className="eventBtnGhost" onClick={onCancelEdit} disabled={isSaving}>
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
};

export default EventForm;

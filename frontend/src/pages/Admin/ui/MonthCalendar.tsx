import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons";
import { MONTHS, WEEKDAYS, eventClass, birthdaysOn, daysOf, eventsOn, formatDayTitle, monthOf, shiftMonth, type CalendarItem } from "./calendarUtils";

const MAX_CHIPS = 3;

type Props<T extends CalendarItem> = {
  events: T[];
  month: string;
  onMonth: (month: string) => void;
  today: string;
  selected: string | null;
  onSelect: (day: string) => void;
  /** Texto pequeño extra al final de cada chip (p. ej. "4,5 ★"). */
  chipExtra?: (event: T) => ReactNode;
  /** Panel del día elegido (a la derecha). Sin panel, el calendario ocupa todo el ancho. */
  children?: ReactNode;
  /** Versión pequeña (tarjeta del perfil): días más bajos y sin leyenda. */
  compact?: boolean;
  legend?: ReactNode;
  /** Cumpleaños de los servidores: solo se muestran (no se pueden editar). */
  birthdays?: { _id: string; name: string; monthDay: string }[];
};

// Calendario mensual (estilo del de eventos de cytek): cada día muestra sus eventos y al elegirlo
// se ve el detalle en el panel de la derecha.
const MonthCalendar = <T extends CalendarItem>({ events, month, onMonth, today, selected, onSelect, chipExtra, children, legend, birthdays = [], compact = false }: Props<T>) => {
  const [y, m] = month.split("-").map(Number);
  const firstWeekday = (new Date(y, m - 1, 1).getDay() + 6) % 7; // Lunes primero

  return (
    <div className={`calLayout${children ? "" : " calLayoutSolo"}${compact ? " calCompact" : ""}`}>
      <div className="calCard" aria-label="Calendario">
        <div className="calBar">
          <div className="calMonth">
            <button type="button" className="adIconButton" onClick={() => onMonth(shiftMonth(month, -1))} aria-label="Mes anterior">
              <ChevronLeftIcon />
            </button>
            <h2>
              {MONTHS[m - 1]} {y}
            </h2>
            <button type="button" className="adIconButton" onClick={() => onMonth(shiftMonth(month, 1))} aria-label="Mes siguiente">
              <ChevronRightIcon />
            </button>
          </div>
          {monthOf(today) !== month && (
            <button type="button" className="toolbarButton" onClick={() => onMonth(monthOf(today))}>
              Hoy
            </button>
          )}
        </div>

        <div className="calGrid" role="grid">
          {WEEKDAYS.map((w) => (
            <div key={w} className="calWeekday" role="columnheader">
              {w}
            </div>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => (
            <div key={`vacio-${i}`} className="calDay calDayEmpty" aria-hidden="true" />
          ))}
          {daysOf(month).map((day) => {
            const list = eventsOn(events, day);
            const cumples = birthdaysOn(birthdays, day);
            return (
              <button
                key={day}
                type="button"
                role="gridcell"
                className={`calDay${day === today ? " isToday" : ""}${day === selected ? " isSelected" : ""}${day < today ? " isPast" : ""}`}
                onClick={() => onSelect(day)}
                aria-label={`${formatDayTitle(day)}: ${list.length} eventos${cumples.length ? `, ${cumples.length} cumpleaños` : ""}`}
              >
                <span className="calDayNumber">{Number(day.slice(8))}</span>
                <span className="calDayEvents">
                  {cumples.slice(0, 2).map((b) => (
                    <span key={`cumple-${b._id}`} className="calChip cumple">
                      🎂 {b.name}
                    </span>
                  ))}
                  {cumples.length > 2 && <span className="calChip cumple">🎂 +{cumples.length - 2} más</span>}
                  {list.slice(0, MAX_CHIPS).map((e) => (
                    <span key={e._id} className={`calChip ${eventClass(e)}`}>
                      {e.start ? `${e.start} ` : ""}
                      {e.title}
                      {chipExtra && <span className="calChipExtra">{chipExtra(e)}</span>}
                    </span>
                  ))}
                  {list.length > MAX_CHIPS && <span className="calChip more">+{list.length - MAX_CHIPS} más</span>}
                </span>
              </button>
            );
          })}
        </div>

        {!compact && (
        <p className="calLegend">
          <span className="calChip abierta">Reunión abierta</span>
          <span className="calChip cerrada">Reunión cerrada</span>
          <span className="calChip formacion">Formación</span>
          <span className="calChip retiro">Retiro</span>
          <span className="calChip otro">Otro</span>
          {birthdays.length > 0 && <span className="calChip cumple">🎂 Cumpleaños</span>}
          {legend}
        </p>
        )}
      </div>

      {children && (
        <aside className="calPanel" aria-live="polite">
          {children}
        </aside>
      )}
    </div>
  );
};

export default MonthCalendar;

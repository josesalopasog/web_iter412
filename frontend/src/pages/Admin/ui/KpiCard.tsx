import type { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon } from "../icons";
import type { AdminIcon } from "../icons";

/**
 * todos = morado · hombres = verde · mujeres = rosa · finanzas = azul · info = azul ·
 * positivo = verde esmeralda (pagado, activo) · negativo = rojo (pendiente, sin pago) · neutral = gris
 */
export type Tone = "todos" | "hombres" | "mujeres" | "finanzas" | "info" | "positivo" | "negativo" | "neutral";

type Props = {
  label: string;
  value: ReactNode;
  icon: AdminIcon;
  tone?: Tone;
  /** Cambio contra el periodo anterior (null = nada con qué comparar). */
  change?: { value: string; isUp: boolean } | null;
  /** Si subir es malo (p. ej. lo que falta por pagar), el color se invierte. */
  upIsBad?: boolean;
  detail?: ReactNode;
  /** Barra de progreso (0 a 1) debajo del valor. */
  progress?: number;
};

// Tarjeta de un número del dashboard (estilo cytek, colores de Iter).
const KpiCard = ({ label, value, icon: Icon, tone = "info", change, upIsBad, detail, progress }: Props) => (
  <article className={`kpiCard tone-${tone}`}>
    <div className="kpiCardTop">
      <span className="kpiCardLabel">{label}</span>
      <span className="kpiCardIcon">
        <Icon />
      </span>
    </div>
    <span className="kpiCardValue">{value}</span>
    {progress !== undefined && (
      <div className="kpiCardProgress" aria-hidden="true">
        <div style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }} />
      </div>
    )}
    {(change || detail) && (
      <div className="kpiCardBottom">
        {change && (
          <span className={`kpiCardChange ${change.isUp !== Boolean(upIsBad) ? "good" : "bad"}`}>
            {change.isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
            <span className="srOnly">{change.isUp ? "Subió" : "Bajó"}</span>
            {change.value}
          </span>
        )}
        {detail && <span className="kpiCardDetail">{detail}</span>}
      </div>
    )}
  </article>
);

export default KpiCard;

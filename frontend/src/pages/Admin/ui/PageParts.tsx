import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "../icons";
import { PageLoader } from "../../../components/Spinner";

export type Range = 7 | 30 | 90;

const RANGES: { value: Range; label: string }[] = [
  { value: 7, label: "7 días" },
  { value: 30, label: "30 días" },
  { value: 90, label: "90 días" },
];

/** Botones segmentados (periodo, estados de una tabla...). */
export const Segmented = <T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode; count?: number; dot?: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) => (
  <div className="segmented" role="group" aria-label={label}>
    {options.map((o) => (
      <button
        key={String(o.value)}
        type="button"
        className={`segmentedButton ${value === o.value ? "selected" : ""}`}
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
      >
        {o.dot && <span className="segmentedDot" style={{ backgroundColor: o.dot }} />}
        {o.label}
        {o.count !== undefined && <span className="segmentedCount">{o.count}</span>}
      </button>
    ))}
  </div>
);

export const RangeSelector = ({ value, onChange }: { value: Range; onChange: (range: Range) => void }) => (
  <Segmented options={RANGES} value={value} onChange={onChange} label="Periodo" />
);

type Crumb = { label: string; to?: string };

/** Título de la página con migas de pan, subtítulo y acciones a la derecha. */
export const PageHeading = ({
  crumbs,
  title,
  subtitle,
  children,
}: {
  crumbs: Crumb[];
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
}) => (
  <div className="pageHeading">
    <div>
      <nav className="breadcrumbs" aria-label="Ruta">
        <ol>
          {crumbs.map((c, i) => (
            <li key={c.label}>
              {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
              {i < crumbs.length - 1 && <ChevronRightIcon />}
            </li>
          ))}
        </ol>
      </nav>
      <h1 className="pageTitle">{title}</h1>
      {subtitle && <p className="pageSubtitle">{subtitle}</p>}
    </div>
    {children && <div className="pageHeadingActions">{children}</div>}
  </div>
);

/** Estados de carga y error de una página que pide sus datos. */
export const PageState = ({ isLoading, error }: { isLoading: boolean; error: string | null }) => {
  if (isLoading) return <PageLoader variant="inline" label="Cargando datos" />;
  if (error) return <p className="pageMessage">{error}</p>;
  return null;
};

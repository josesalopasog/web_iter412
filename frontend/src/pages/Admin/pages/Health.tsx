import { useMemo } from "react";
import { PageLoader } from "../../../components/Spinner";
import type { ServidorRecord, SoldadoRecord } from "../../../api/adminUsers";
import { serviceStatusOf } from "../../Dashboard/ui/serviceStatus";
import { formatEnumLabel } from "../../Profile/ui/format";
import { useAdminData } from "../AdminData";
import KpiCard from "../ui/KpiCard";
import { BarList, ChartCard } from "../ui/Charts";
import { COLORS } from "../ui/colors";
import DataTable, { type DataColumn, type DataTab } from "../ui/DataTable";
import { PageHeading } from "../ui/PageParts";
import { ClipboardIcon, HeartPulseIcon, ShieldIcon, UsersIcon } from "../icons";
import { formatNumber, formatPercent, formatRegNum, isHombre, isMujer } from "../format";
import { countBy } from "./peopleStats";

type Group = "soldados" | "servidores";

type Row = {
  _id: string;
  registrationNumber: number;
  name: string;
  gender: string;
  restrictions: string[];
  detail: string;
  eps: string;
  bloodType: string;
  emergency: string;
  emergencyPhone: string;
  emergencyRelation: string;
};

const RESTRICTION_LABELS: Record<string, string> = {
  PROBLEMAS_DORMIR_SOLO: "Problemas para dormir solo",
  ALERGIAS: "Alergias",
  TOMA_MEDICAMENTOS: "Toma medicamentos",
  RESTRICCION_ALIMENTICIA: "Restricción alimenticia",
  OTRO: "Otro",
};

const restrictionsOf = (r: SoldadoRecord | ServidorRecord) =>
  (Array.isArray(r.restrictions) ? (r.restrictions as string[]) : []).filter((x) => x && x !== "NINGUNA");

const toRow = (r: SoldadoRecord | ServidorRecord): Row => ({
  _id: r._id,
  registrationNumber: r.registrationNumber,
  name: `${r.firstNames} ${r.lastNames}`,
  gender: isHombre(r.gender) ? "Hombre" : isMujer(r.gender) ? "Mujer" : "-",
  restrictions: restrictionsOf(r),
  detail: [r.restrictionsOther, r.medicationsDetail].map((x) => String(x ?? "").trim()).filter(Boolean).join(" · "),
  eps: String(r.eps ?? ""),
  bloodType: String(r.bloodType ?? "").toUpperCase(),
  emergency: `${String(r.emergencyFirstName ?? "")} ${String(r.emergencyLastName ?? "")}`.trim(),
  emergencyPhone: String(r.emergencyPhone ?? ""),
  emergencyRelation: String(r.emergencyRelation ?? ""),
});

const restrictionText = (r: Row) => r.restrictions.map((x) => RESTRICTION_LABELS[x] ?? formatEnumLabel(x)).join(", ");

const baseColumns: DataColumn<Row>[] = [
  { key: "num", label: "#", className: "cellStrong", render: (r) => formatRegNum(r.registrationNumber), value: (r) => formatRegNum(r.registrationNumber) },
  { key: "name", label: "Nombre", render: (r) => r.name, value: (r) => r.name },
  { key: "gender", label: "Género", className: "cellMuted", render: (r) => r.gender, value: (r) => r.gender },
];

const restrictionColumns: DataColumn<Row>[] = [
  {
    key: "restrictions",
    label: "Restricciones",
    className: "cellWrap",
    render: (r) => (r.restrictions.length ? restrictionText(r) : <span className="cellMuted">Ninguna</span>),
    value: restrictionText,
  },
  { key: "detail", label: "Detalle", className: "cellWrap", render: (r) => r.detail || "-", value: (r) => r.detail },
];

const careColumns: DataColumn<Row>[] = [
  { key: "blood", label: "RH", render: (r) => r.bloodType || "-", value: (r) => r.bloodType },
  { key: "eps", label: "EPS", className: "cellMuted", render: (r) => r.eps || "-", value: (r) => r.eps },
  { key: "emergency", label: "Contacto de emergencia", render: (r) => r.emergency || "-", value: (r) => r.emergency },
  { key: "relation", label: "Parentesco", className: "cellMuted", render: (r) => r.emergencyRelation || "-", value: (r) => r.emergencyRelation },
  { key: "phone", label: "Teléfono emergencia", className: "cellMuted", render: (r) => r.emergencyPhone || "-", value: (r) => r.emergencyPhone },
];

/**
 * Salud y alimentación de un grupo: restricciones, medicamentos, RH, EPS y contactos de emergencia.
 * Soldados: lo que marcaron en el formulario. Servidores (activos): los datos de cuidado.
 */
const Health = ({ group }: { group: Group }) => {
  const data = useAdminData();
  const isSoldados = group === "soldados";
  const people = useMemo(
    () => (isSoldados ? data.soldados : data.servidores.filter((s) => serviceStatusOf(s) === "ACTIVO")),
    [isSoldados, data.soldados, data.servidores]
  );
  const rows = useMemo(() => people.map(toRow), [people]);

  const withRestriction = rows.filter((r) => r.restrictions.length > 0);
  const count = (code: string) => rows.filter((r) => r.restrictions.includes(code)).length;
  const restrictionCounts = useMemo(() => countBy(people, (r) => restrictionsOf(r).map((x) => RESTRICTION_LABELS[x] ?? x), 8), [people]);
  const bloodTypes = useMemo(() => countBy(people, (r) => String(r.bloodType ?? "").toUpperCase(), 8), [people]);
  const epsList = useMemo(() => countBy(people, (r) => String(r.eps ?? ""), 8), [people]);
  const missingEmergency = rows.filter((r) => !r.emergencyPhone).length;

  const columns = [...baseColumns, ...(isSoldados ? restrictionColumns : []), ...careColumns];
  const tabs: DataTab<Row>[] = [
    ...(isSoldados ? [{ value: "restricciones", label: "Con restricciones", match: (r: Row) => r.restrictions.length > 0, dot: COLORS.negativo }] : []),
    { value: "hombres", label: "Hombres", match: (r) => r.gender === "Hombre", dot: COLORS.hombres },
    { value: "mujeres", label: "Mujeres", match: (r) => r.gender === "Mujer", dot: COLORS.mujeres },
    { value: "todos", label: "Todos", dot: COLORS.todos },
  ];

  if (data.isLoading) return <PageLoader variant="inline" label="Cargando datos" />;

  const groupLabel = isSoldados ? "Soldados" : "Servidores";

  return (
    <div className="adPage">
      <PageHeading
        crumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: groupLabel, to: `/dashboard/${group}` }, { label: "Salud y alimentación" }]}
        title={`Salud y alimentación de ${groupLabel.toLowerCase()}`}
        subtitle={
          isSoldados
            ? "Restricciones, medicamentos, tipo de sangre y contactos de emergencia que dieron al inscribirse."
            : "Tipo de sangre, EPS y contactos de emergencia de los servidores activos."
        }
      />

      <div className="kpiGrid">
        {isSoldados ? (
          <>
            <KpiCard tone="info"
              label="Con alguna restricción"
              icon={HeartPulseIcon}
              value={formatNumber(withRestriction.length)}
              progress={rows.length ? withRestriction.length / rows.length : 0}
              detail={`${formatPercent(rows.length ? withRestriction.length / rows.length : 0)} de ${formatNumber(rows.length)} soldados`}
            />
            <KpiCard tone="info" label="Restricción alimenticia" icon={ClipboardIcon} value={formatNumber(count("RESTRICCION_ALIMENTICIA"))} detail="Para el equipo de comedor" />
            <KpiCard tone="info" label="Toman medicamentos" icon={HeartPulseIcon} value={formatNumber(count("TOMA_MEDICAMENTOS"))} />
            <KpiCard
              tone="info"
              label="Alergias"
              icon={ShieldIcon}
              value={formatNumber(count("ALERGIAS"))}
              detail={`${formatNumber(count("PROBLEMAS_DORMIR_SOLO"))} con problemas para dormir solos`}
            />
          </>
        ) : (
          <>
            <KpiCard tone="todos" label="Servidores activos" icon={UsersIcon} value={formatNumber(rows.length)} />
            <KpiCard tone="info" label="RH más común" icon={HeartPulseIcon} value={bloodTypes[0]?.label ?? "—"} detail={bloodTypes[0] ? `${bloodTypes[0].value} servidores` : undefined} />
            <KpiCard tone="info" label="EPS más común" icon={ClipboardIcon} value={epsList[0]?.label ?? "—"} detail={epsList[0] ? `${epsList[0].value} servidores` : undefined} />
            <KpiCard tone="info"
              label="Sin teléfono de emergencia"
              icon={ShieldIcon}
              value={formatNumber(missingEmergency)}
              detail={missingEmergency ? "Pídeles que lo completen en su perfil" : "Todos lo tienen"}
            />
          </>
        )}
      </div>

      <div className="pageGrid pageGridHalf">
        {isSoldados ? (
          <ChartCard title="Restricciones" subtitle="Lo que marcaron al inscribirse">
            <BarList
              emptyText="Ningún soldado reportó restricciones."
              color={COLORS.info}
              items={restrictionCounts.map((c) => ({ label: c.label, value: c.value, display: formatNumber(c.value) }))}
            />
          </ChartCard>
        ) : (
          <ChartCard title="EPS" subtitle="De los servidores activos">
            <BarList emptyText="Sin datos." color={COLORS.info} items={epsList.map((c) => ({ label: c.label, value: c.value, display: formatNumber(c.value) }))} />
          </ChartCard>
        )}
        <ChartCard title="Tipos de sangre">
          <BarList emptyText="Sin datos." color={COLORS.info2} items={bloodTypes.map((c) => ({ label: c.label, value: c.value, display: formatNumber(c.value) }))} />
        </ChartCard>
      </div>

      <ChartCard title="Fichas de salud" subtitle="Información confidencial: úsala solo para el cuidado de los participantes">
        <DataTable
          id={`salud-${group}`}
          rows={rows}
          columns={columns}
          getRowId={(r) => r._id}
          tabs={tabs}
          searchPlaceholder="Buscar por nombre, EPS, RH..."
          emptyText="Aún no hay inscritos."
        />
      </ChartCard>
    </div>
  );
};

export const SoldadosHealth = () => <Health group="soldados" />;
export const ServidoresHealth = () => <Health group="servidores" />;

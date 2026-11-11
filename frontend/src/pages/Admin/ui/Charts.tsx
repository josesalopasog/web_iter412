import { useId, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactNumber, formatLongDay, formatShortDay } from "../format";

import { COLORS, type ChartSeries } from "./colors";

export type { ChartSeries };

const axisTick = { fill: "var(--ad-text-muted)", fontSize: 12 };
const axisLine = { stroke: "var(--ad-border)" };

/*--- Tarjeta que envuelve cada gráfica ---*/
type ChartCardProps = {
  title: string;
  subtitle?: string;
  headline?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
};

export const ChartCard = ({ title, subtitle, headline, actions, className = "", children }: ChartCardProps) => (
  <div className={`chartCard ${className}`}>
    <div className="chartCardHeader">
      <div>
        <h2 className="chartCardTitle">{title}</h2>
        {subtitle && <p className="chartCardSubtitle">{subtitle}</p>}
      </div>
      {headline && <div className="chartCardHeadline">{headline}</div>}
      {actions}
    </div>
    {children}
  </div>
);

/*--- Tooltip ---*/
type TooltipProps = {
  active?: boolean;
  payload?: readonly { dataKey?: unknown; value?: unknown }[];
  label?: string | number;
  series: ChartSeries[];
  format: (value: number) => string;
  showTotal?: boolean;
  labelFormat?: (label: string) => string;
};

const ChartTooltip = ({ active, payload, label, series, format, showTotal, labelFormat = formatLongDay }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  const valueOf = (key: string) => Number(payload.find((p) => p.dataKey === key)?.value ?? 0);
  return (
    <div className="chartTooltip">
      <span className="chartTooltipDate">{labelFormat(String(label))}</span>
      {series.map((s) => (
        <span key={s.key} className="chartTooltipRow">
          <span className="chartTooltipSwatch" style={{ backgroundColor: s.color }} />
          {s.name}
          <strong>{format(valueOf(s.key))}</strong>
        </span>
      ))}
      {showTotal && (
        <span className="chartTooltipRow chartTooltipTotal">
          Total
          <strong>{format(series.reduce((sum, s) => sum + valueOf(s.key), 0))}</strong>
        </span>
      )}
    </div>
  );
};

/*--- Leyenda ---*/
export const ChartLegend = ({ items }: { items: { label: string; color: string; value?: string }[] }) => (
  <ul className="chartLegend">
    {items.map((item) => (
      <li key={item.label} className="chartLegendItem">
        <span className="chartLegendSwatch" style={{ backgroundColor: item.color }} />
        {item.label}
        {item.value && <strong>{item.value}</strong>}
      </li>
    ))}
  </ul>
);

/*--- Tendencia por día (áreas; apiladas si stacked) ---*/
type TrendChartProps = {
  data: Record<string, string | number>[];
  series: ChartSeries[];
  format: (value: number) => string;
  axisFormat?: (value: number) => string;
  label: string;
  height?: number;
  stacked?: boolean;
};

export const TrendChart = ({
  data,
  series,
  format,
  axisFormat = formatCompactNumber,
  label,
  height = 260,
  stacked,
}: TrendChartProps) => {
  const id = useId().replace(/:/g, "");
  return (
    <div className="chartArea" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={series.length > 1 ? 0.22 : 0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid vertical={false} stroke="var(--ad-border)" />
          <XAxis dataKey="date" tickFormatter={formatShortDay} tick={axisTick} axisLine={axisLine} tickLine={false} minTickGap={28} />
          <YAxis tickFormatter={axisFormat} tick={axisTick} axisLine={false} tickLine={false} width={64} allowDecimals={false} />
          <Tooltip
            content={(props) => <ChartTooltip {...props} series={series} format={format} showTotal={stacked} />}
            cursor={{ stroke: "var(--ad-text-muted)", strokeDasharray: "3 3" }}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stackId={stacked ? "stack" : undefined}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#${id}-${s.key})`}
              dot={false}
              activeDot={{ r: 4, fill: s.color, stroke: "#fff", strokeWidth: 2 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

/*--- Columnas por día (una o varias series, apiladas) ---*/
type StackedBarsProps = {
  data: Record<string, string | number>[];
  series: ChartSeries[];
  format: (value: number) => string;
  axisFormat?: (value: number) => string;
  label: string;
  height?: number;
};

export const StackedBars = ({ data, series, format, axisFormat = formatCompactNumber, label, height = 240 }: StackedBarsProps) => (
  <div className="chartArea" role="img" aria-label={label}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--ad-border)" />
        <XAxis dataKey="date" tickFormatter={formatShortDay} tick={axisTick} axisLine={axisLine} tickLine={false} minTickGap={28} />
        <YAxis tickFormatter={axisFormat} tick={axisTick} axisLine={false} tickLine={false} width={64} allowDecimals={false} />
        <Tooltip
          content={(props) => <ChartTooltip {...props} series={series} format={format} showTotal={series.length > 1} />}
          cursor={{ fill: "var(--ad-hover)" }}
        />
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            stackId="stack"
            fill={s.color}
            maxBarSize={22}
            radius={i === series.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/*--- Columnas de una serie (horas, días de la semana, edades...) ---*/
type ColumnChartProps = {
  data: Record<string, string | number>[];
  xKey: string;
  series: ChartSeries;
  format: (value: number) => string;
  tickFormat?: (value: string) => string;
  labelFormat?: (label: string) => string;
  highlight?: string | number;
  label: string;
  height?: number;
};

export const ColumnChart = ({ data, xKey, series, format, tickFormat, labelFormat, highlight, label, height = 220 }: ColumnChartProps) => (
  <div className="chartArea" role="img" aria-label={label}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--ad-border)" />
        <XAxis dataKey={xKey} tickFormatter={tickFormat} tick={axisTick} axisLine={axisLine} tickLine={false} interval="preserveStartEnd" minTickGap={8} />
        <YAxis tickFormatter={formatCompactNumber} tick={axisTick} axisLine={false} tickLine={false} width={44} allowDecimals={false} />
        <Tooltip
          content={(props) => (
            <ChartTooltip {...props} series={[series]} format={format} labelFormat={labelFormat ?? tickFormat ?? String} />
          )}
          cursor={{ fill: "var(--ad-hover)" }}
        />
        <Bar dataKey={series.key} radius={[4, 4, 0, 0]} maxBarSize={30}>
          {data.map((point) => (
            <Cell
              key={String(point[xKey])}
              fill={series.color}
              fillOpacity={highlight === undefined || point[xKey] === highlight ? 1 : 0.45}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/*--- Barras horizontales con etiqueta y valor ---*/
export type BarListItem = { label: string; value: number; display: string; detail?: string; color?: string };

export const BarList = ({ items, emptyText, color = COLORS.accent }: { items: BarListItem[]; emptyText: string; color?: string }) => {
  const max = Math.max(...items.map((item) => item.value), 0);
  if (max === 0) return <p className="pageEmpty">{emptyText}</p>;
  return (
    <ul className="barList">
      {items.map((item) => (
        <li key={item.label}>
          <div className="barListText">
            <span className="barListLabel">{item.label}</span>
            <span className="barListValue">
              {item.display}
              {item.detail && <span className="barListDetail">{item.detail}</span>}
            </span>
          </div>
          <div className="barListTrack">
            <div className="barListFill" style={{ width: `${(item.value / max) * 100}%`, backgroundColor: item.color ?? color }} />
          </div>
        </li>
      ))}
    </ul>
  );
};

/*--- Dona con el total en el centro ---*/
type DonutProps = {
  items: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
  format: (value: number) => string;
  emptyText: string;
};

export const DonutChart = ({ items, centerLabel, centerValue, format, emptyText }: DonutProps) => {
  const total = items.reduce((sum, i) => sum + i.value, 0);
  if (!total) return <p className="pageEmpty">{emptyText}</p>;
  return (
    <div className="donut">
      <div className="donutChart" role="img" aria-label={`${centerLabel}: ${centerValue}`}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={items} dataKey="value" nameKey="label" innerRadius={58} outerRadius={82} paddingAngle={2} stroke="none">
              {items.map((i) => (
                <Cell key={i.label} fill={i.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="chartTooltip">
                    <span className="chartTooltipRow">
                      <span className="chartTooltipSwatch" style={{ backgroundColor: String(payload[0].payload.color) }} />
                      {String(payload[0].name)}
                      <strong>{format(Number(payload[0].value))}</strong>
                    </span>
                  </div>
                ) : null
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donutCenter">
          <strong>{centerValue}</strong>
          <span>{centerLabel}</span>
        </div>
      </div>
      <ul className="donutLegend">
        {items.map((i) => (
          <li key={i.label}>
            <span className="chartLegendSwatch" style={{ backgroundColor: i.color }} />
            <span className="donutLegendLabel">{i.label}</span>
            <strong>{format(i.value)}</strong>
            <span className="donutLegendPct">{Math.round((i.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/*--- Barra 100 % de cómo se cubre un monto: pagado + subsidio + falta ---*/
type MoneySplitRow = { label: string; detail?: string; expected: number; paid: number; subsidy: number; due: number };

const copFormat = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

export const MoneySplit = ({ rows }: { rows: MoneySplitRow[] }) => (
  <ul className="moneySplit">
    {rows.map((r) => {
      const total = Math.max(r.expected, r.paid + r.subsidy + r.due, 1);
      const pct = (v: number) => `${(v / total) * 100}%`;
      const covered = r.expected ? Math.min(1, (r.paid + r.subsidy) / r.expected) : 0;
      return (
        <li key={r.label}>
          <div className="moneySplitHead">
            <span>
              <strong>{r.label}</strong>
              {r.detail && <span className="moneySplitDetail">{r.detail}</span>}
            </span>
            <span className="moneySplitPct">{Math.round(covered * 100)}% cubierto</span>
          </div>
          <div className="moneySplitBar" role="img" aria-label={`${r.label}: ${Math.round(covered * 100)}% cubierto`}>
            <span style={{ width: pct(r.paid), backgroundColor: COLORS.positivo }} title={`Pagado ${copFormat.format(r.paid)}`} />
            <span style={{ width: pct(r.subsidy), backgroundColor: COLORS.finanzas3 }} title={`Subsidio ${copFormat.format(r.subsidy)}`} />
            <span style={{ width: pct(r.due), backgroundColor: COLORS.negativo }} title={`Falta ${copFormat.format(r.due)}`} />
          </div>
          <div className="moneySplitValues">
            <span>Pagado <strong>{copFormat.format(r.paid)}</strong></span>
            <span>Subsidio <strong>{copFormat.format(r.subsidy)}</strong></span>
            <span>Falta <strong>{copFormat.format(r.due)}</strong></span>
          </div>
        </li>
      );
    })}
  </ul>
);

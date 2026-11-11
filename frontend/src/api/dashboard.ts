import { API_URL, authedRequest } from "./http";

export type KpiValue = { value: number; previous: number };

type PaymentGroupTotals = {
  count: number;
  price: number;
  expected: number;
  paid: number;
  subsidy: number;
  due: number;
  status: { completo: number; parcial: number; sinPago: number };
};

type GenderCount = { hombres: number; mujeres: number; otros: number };

export type DashboardSummary = {
  range: number;
  from: string;
  to: string;
  retreat: { number: number; friday: number; sunday: number; month: number; year: number; daysToRetreat: number };
  kpis: {
    soldados: KpiValue & { total: number };
    servidores: KpiValue & { total: number; active: number };
    registrations: KpiValue;
    income: KpiValue;
    collected: number;
    expected: number;
    due: number;
    subsidy: { used: number; cap: number };
    pageViews: KpiValue & { visitors: number };
  };
  series: {
    date: string;
    soldados: number;
    servidores: number;
    pagosSoldados: number;
    pagosServidores: number;
    views: number;
    visitors: number;
  }[];
  gender: { soldados: GenderCount; servidores: GenderCount };
  paymentStatus: { soldados: PaymentGroupTotals; servidores: PaymentGroupTotals };
  servidoresByStatus: { ACTIVO: number; INACTIVO: number; SANTISIMO_NOCTURNO: number };
  upcomingEvents: {
    _id: string;
    title: string;
    dateISO: string;
    endDateISO: string;
    start: string;
    end: string;
    location: string;
    tag: string;
  }[];
  recentRegistrations: {
    _id: string;
    group: "soldados" | "servidores";
    name: string;
    registrationNumber: number;
    gender: string;
    city: string;
    paid: number;
    subsidy: number;
    price: number;
    createdAt: string;
  }[];
};

export type AnalyticsSummary = {
  range: number;
  from: string;
  to: string;
  kpis: { views: KpiValue; visitors: KpiValue; viewsPerVisitor: KpiValue };
  series: { date: string; views: number; visitors: number }[];
  byHour: { hour: number; views: number }[];
  byWeekday: { day: number; views: number }[];
  topPages: { path: string; views: number; visitors: number }[];
  sections: { public: number; internal: number };
};

export type PaymentMovement = {
  date: string;
  group: "soldados" | "servidores";
  kind: "pago" | "subsidio" | "merch";
  person: string;
  delta: number;
  amount: number;
  by: string;
};

export type Debtor = {
  _id: string;
  group: "soldados" | "servidores";
  name: string;
  registrationNumber: number;
  paid: number;
  subsidy: number;
  due: number;
};

export type FinanceSummary = {
  range: number;
  from: string;
  to: string;
  settings: { soldadoPrice: number; servidorPrice: number; subsidyCap: number };
  kpis: {
    income: KpiValue;
    paid: number;
    expected: number;
    due: number;
    collectionRate: number;
    subsidy: { used: number; cap: number };
    merch: { expected: number; paid: number; orders: number };
    movements: number;
  };
  soldados: PaymentGroupTotals;
  servidores: PaymentGroupTotals;
  series: { date: string; soldados: number; servidores: number; merch: number; subsidio: number }[];
  debtors: Debtor[];
  recentMovements: PaymentMovement[];
};

export const getDashboardSummary = (range: number) =>
  authedRequest<DashboardSummary>(`/api/dashboard/summary?range=${range}`);

export const getAnalyticsSummary = (range: number) =>
  authedRequest<AnalyticsSummary>(`/api/analytics/summary?range=${range}`);

export const getFinanceSummary = (range: number) =>
  authedRequest<FinanceSummary>(`/api/finance/summary?range=${range}`);

const VISITOR_KEY = "iter412:visitante";

const visitorId = () => {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
};

/** Registra una visita a una página (para la analítica del dashboard). Nunca lanza error. */
export const trackPageView = (path: string) => {
  fetch(`${API_URL}/api/analytics/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, visitorId: visitorId() }),
    keepalive: true,
  }).catch(() => {
    // Sin conexión: la visita simplemente no se cuenta.
  });
};

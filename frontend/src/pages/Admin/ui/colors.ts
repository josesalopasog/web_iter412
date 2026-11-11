// Paleta del dashboard (variables de .adminShell en styles.css):
//   morado  = todos / totales (soldados y servidores)
//   verde   = hombres
//   rosa    = mujeres
//   azul    = finanzas (pagos, merch, subsidio), igual que el resto
//   azul    = todo lo demás (visitas, salud, reuniones...)
//   verde esmeralda = positivo (activo, pagado) · rojo = pendiente / sin pago · gris = inactivo

export type ChartSeries = { key: string; name: string; color: string };

export const COLORS = {
  todos: "var(--iter-todos)",
  soldados: "var(--iter-soldados)",
  servidores: "var(--iter-servidores)",
  hombres: "var(--iter-hombres)",
  mujeres: "var(--iter-mujeres)",
  finanzas: "var(--iter-finanzas)",
  finanzas2: "var(--iter-finanzas-2)",
  finanzas3: "var(--iter-finanzas-3)",
  finanzasOscuro: "var(--iter-finanzas-oscuro)",
  pedido: "var(--iter-finanzas)",
  subsidio: "var(--iter-finanzas-3)",
  info: "var(--iter-info)",
  info2: "var(--iter-info-2)",
  info3: "var(--iter-info-3)",
  visitas: "var(--iter-info)",
  visitantes: "var(--iter-info-2)",
  santisimo: "var(--iter-info-3)",
  inactivo: "var(--iter-inactivo)",
  parcial: "var(--iter-parcial)",
  positivo: "var(--iter-positivo)",
  negativo: "var(--iter-negativo)",
  accent: "var(--iter-accent)",
};

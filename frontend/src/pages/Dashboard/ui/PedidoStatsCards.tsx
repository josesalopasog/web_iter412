import type { ServidorRecord } from "../../../api/adminUsers";
import type { AppSettings } from "../../../api/settings";
import { formatCOP } from "./paymentConfig";
import { asStringArray, computeOrderTotal, SHIRT_COLORS, SIZES, OUTER_ITEMS, isHombre, isMujer } from "./merchPricing";

type Props = {
  rows: ServidorRecord[];
  settings: AppSettings;
};

type BreakdownRow = { label: string; count: number; paid: number; pending: number };

const buildRow = (label: string, matches: ServidorRecord[], unitPrice: number, settings: AppSettings): BreakdownRow => {
  let paid = 0;
  for (const r of matches) {
    const orderTotal = computeOrderTotal(r, settings);
    const ratio = orderTotal > 0 ? Math.min(1, (r.merchPaymentAmount ?? 0) / orderTotal) : 0;
    paid += unitPrice * ratio;
  }
  const total = unitPrice * matches.length;
  return { label, count: matches.length, paid, pending: Math.max(0, total - paid) };
};

const buildShirtRows = (
  rows: ServidorRecord[],
  genderCheck: (g?: string) => boolean,
  settings: AppSettings
): BreakdownRow[] => {
  const list = rows.filter((r) => genderCheck(r.gender) && r.needsShirt === "SI");

  const baseRows = SHIRT_COLORS.flatMap((color) =>
    SIZES.map((size) => {
      const matches = list.filter(
        (r) => asStringArray(r.shirtColors).includes(color.code) && r.shirtSize === size
      );
      return buildRow(`Camiseta ${color.label.toLowerCase()} talla ${size}`, matches, settings.shirtPrice, settings);
    })
  );

  const otroGroups = new Map<string, ServidorRecord[]>();
  for (const r of list) {
    if (r.shirtSize !== "OTRO") continue;
    const otherText = typeof r.shirtSizeOther === "string" && r.shirtSizeOther ? r.shirtSizeOther : "Otro";
    for (const colorCode of asStringArray(r.shirtColors)) {
      const key = `${colorCode}|${otherText}`;
      const bucket = otroGroups.get(key);
      if (bucket) bucket.push(r);
      else otroGroups.set(key, [r]);
    }
  }
  const otroRows = Array.from(otroGroups.entries()).map(([key, matches]) => {
    const [colorCode, otherText] = key.split("|");
    const colorLabel = SHIRT_COLORS.find((c) => c.code === colorCode)?.label ?? colorCode;
    return buildRow(
      `Camiseta ${colorLabel.toLowerCase()} talla ${otherText}`,
      matches,
      settings.shirtPrice + settings.extraSizePrice,
      settings
    );
  });

  return [...baseRows, ...otroRows];
};

const buildOuterRows = (
  rows: ServidorRecord[],
  genderCheck: (g?: string) => boolean,
  settings: AppSettings
): BreakdownRow[] => {
  const list = rows.filter((r) => genderCheck(r.gender));

  const baseRows = OUTER_ITEMS.flatMap((item) =>
    SIZES.map((size) => {
      const matches = list.filter((r) => asStringArray(r.merchItems).includes(item.code) && r.merchSize === size);
      return buildRow(`${item.label} talla ${size}`, matches, settings.busoChaquetaPrice, settings);
    })
  );

  const otroGroups = new Map<string, ServidorRecord[]>();
  for (const r of list) {
    if (r.merchSize !== "OTRO") continue;
    const otherText = typeof r.merchSizeOther === "string" && r.merchSizeOther ? r.merchSizeOther : "Otro";
    for (const item of OUTER_ITEMS) {
      if (!asStringArray(r.merchItems).includes(item.code)) continue;
      const key = `${item.code}|${otherText}`;
      const bucket = otroGroups.get(key);
      if (bucket) bucket.push(r);
      else otroGroups.set(key, [r]);
    }
  }
  const otroRows = Array.from(otroGroups.entries()).map(([key, matches]) => {
    const [itemCode, otherText] = key.split("|");
    const itemLabel = OUTER_ITEMS.find((i) => i.code === itemCode)?.label ?? itemCode;
    return buildRow(`${itemLabel} talla ${otherText}`, matches, settings.busoChaquetaPrice + settings.extraSizePrice, settings);
  });

  return [...baseRows, ...otroRows];
};

const PedidoStatsCards: React.FC<Props> = ({ rows, settings }) => {
  const canguroMatches = rows.filter((r) => asStringArray(r.merchItems).includes("CANGURO"));
  const cachuchaMatches = rows.filter((r) => asStringArray(r.merchItems).includes("GORRA"));
  const tulaMatches = rows.filter((r) => asStringArray(r.merchItems).includes("TULA"));

  const cards: { title: string; rows: BreakdownRow[] }[] = [
    { title: "Camiseta hombre", rows: buildShirtRows(rows, isHombre, settings) },
    { title: "Camiseta mujer", rows: buildShirtRows(rows, isMujer, settings) },
    { title: "Buso o chaqueta hombre", rows: buildOuterRows(rows, isHombre, settings) },
    { title: "Buso o chaqueta mujer", rows: buildOuterRows(rows, isMujer, settings) },
    {
      title: "Accesorios",
      rows: [
        buildRow("Canguro", canguroMatches, settings.canguroPrice, settings),
        buildRow("Cachucha", cachuchaMatches, settings.cachuchaPrice, settings),
        buildRow("Tulas", tulaMatches, settings.tulaPrice, settings),
      ],
    },
  ];

  return (
    <div className="pedidoStatsGrid">
      {cards.map((card) => (
        <div key={card.title} className="pedidoStatCard">
          <div className="pedidoStatCardTitle">{card.title}</div>
          <table className="pedidoStatTable">
            <thead>
              <tr>
                <th></th>
                <th>Cant.</th>
                <th>Pagado</th>
                <th>Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {card.rows.map((r) => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{r.count}</td>
                  <td>{formatCOP(r.paid)}</td>
                  <td>{formatCOP(r.pending)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="pedidoStatTotalRow">
                <td>Total</td>
                <td>{card.rows.reduce((sum, r) => sum + r.count, 0)}</td>
                <td>{formatCOP(card.rows.reduce((sum, r) => sum + r.paid, 0))}</td>
                <td>{formatCOP(card.rows.reduce((sum, r) => sum + r.pending, 0))}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ))}
    </div>
  );
};

export default PedidoStatsCards;

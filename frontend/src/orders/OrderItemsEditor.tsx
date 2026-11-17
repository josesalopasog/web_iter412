import type { MerchPrices } from "../api/settings";
import type { OrderItemInput, OrderProduct } from "../api/orders";
import { COLORS, CUTS, PRODUCTS, SIZED, SIZES, newItem, normalizeItem, totalOf, unitPriceOf } from "./catalog";
import { formatCOP } from "../pages/Admin/format";
import "./orders.css";

type Props = {
  items: OrderItemInput[];
  onChange: (items: OrderItemInput[]) => void;
  prices: MerchPrices | null;
  /** Corte por defecto de las prendas nuevas (según el género del servidor). */
  defaultCut?: string;
  disabled?: boolean;
};

/**
 * Lista editable de prendas de una orden: prenda, color (camiseta), corte, talla (o talla especial
 * escrita) y cantidad, con el precio de cada línea y el total.
 */
const OrderItemsEditor = ({ items, onChange, prices, defaultCut = "HOMBRE", disabled }: Props) => {
  const update = (index: number, patch: Partial<OrderItemInput>) =>
    onChange(items.map((item, i) => (i === index ? normalizeItem({ ...item, ...patch }) : item)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));

  return (
    <div className="ordEditor">
      {items.map((item, i) => {
        const sized = SIZED.has(item.product);
        const lineTotal = prices ? unitPriceOf(item, prices) * item.quantity : 0;
        return (
          <div className="ordLine" key={i}>
            <label className="ordField ordFieldProduct">
              <span>Prenda</span>
              <select
                value={item.product}
                disabled={disabled}
                onChange={(e) => update(i, { product: e.target.value as OrderProduct })}
              >
                {PRODUCTS.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.emoji} {p.label}
                  </option>
                ))}
              </select>
            </label>

            {item.product === "CAMISETA" && (
              <div className="ordField">
                <span>Color</span>
                <div className="ordSwatches" role="radiogroup" aria-label="Color de la camiseta">
                  {COLORS.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      role="radio"
                      aria-checked={item.color === c.code}
                      title={c.label}
                      disabled={disabled}
                      className={`ordSwatch${item.color === c.code ? " is-on" : ""}`}
                      style={{ "--swatch": c.hex } as React.CSSProperties}
                      onClick={() => update(i, { color: c.code })}
                    >
                      <span className="srOnly">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {sized && (
              <label className="ordField">
                <span>Corte</span>
                <select value={item.cut} disabled={disabled} onChange={(e) => update(i, { cut: e.target.value })}>
                  {CUTS.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {sized && (
              <label className="ordField ordFieldSmall">
                <span>Talla</span>
                <select value={item.size} disabled={disabled} onChange={(e) => update(i, { size: e.target.value })}>
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s === "OTRO" ? "Otra" : s}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {sized && item.size === "OTRO" && (
              <label className="ordField ordFieldSmall">
                <span>¿Cuál?</span>
                <input
                  value={item.sizeOther}
                  maxLength={40}
                  placeholder="Ej: XL"
                  disabled={disabled}
                  className={item.sizeOther.trim() ? undefined : "is-missing"}
                  onChange={(e) => update(i, { sizeOther: e.target.value })}
                />
              </label>
            )}

            <label className="ordField ordFieldQty">
              <span>Cant.</span>
              <input
                type="number"
                min={1}
                max={10}
                value={item.quantity}
                disabled={disabled}
                onChange={(e) => update(i, { quantity: Number(e.target.value) })}
              />
            </label>

            <span className="ordLinePrice">{prices ? formatCOP(lineTotal) : ""}</span>

            {!disabled && (
              <button type="button" className="ordRemove" title="Quitar prenda" onClick={() => remove(i)} aria-label="Quitar prenda">
                ✕
              </button>
            )}
          </div>
        );
      })}

      <div className="ordEditorFoot">
        {!disabled && items.length < 20 && (
          <button type="button" className="toolbarButton" onClick={() => onChange([...items, newItem(defaultCut)])}>
            + Agregar prenda
          </button>
        )}
        {prices && (
          <span className="ordEditorTotal">
            Total <strong>{formatCOP(totalOf(items, prices))}</strong>
          </span>
        )}
      </div>
      {prices && prices.extraSizePrice > 0 && (
        <p className="ordHint">Las tallas especiales (“Otra”) tienen un recargo de {formatCOP(prices.extraSizePrice)} por prenda.</p>
      )}
    </div>
  );
};

export default OrderItemsEditor;

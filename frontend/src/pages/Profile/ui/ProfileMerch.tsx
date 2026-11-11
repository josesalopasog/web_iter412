import { useEffect, useState } from "react";
import { updateMyServidorField } from "../../../api/adminUsers";
import type { ServidorRecord } from "../../../api/adminUsers";
import { getMerchPrices } from "../../../api/settings";
import type { AppSettings, MerchPrices } from "../../../api/settings";
import { computeOrderTotal } from "../../Dashboard/ui/merchPricing";
import { formatCOP } from "../../Dashboard/ui/paymentConfig";
import ServidorProfileForm from "./ServidorProfileForm";

type Props = {
  data: Record<string, unknown>;
  onSaved: () => void;
};

const PRICE_LABELS: { key: keyof MerchPrices; label: string }[] = [
  { key: "shirtPrice", label: "Camiseta" },
  { key: "busoChaquetaPrice", label: "Buso o chaqueta" },
  { key: "canguroPrice", label: "Canguro" },
  { key: "tulaPrice", label: "Tula" },
  { key: "cachuchaPrice", label: "Cachucha" },
  { key: "extraSizePrice", label: "Talla especial (recargo)" },
];

// Merch: el servidor pide su ropa (camisetas, busos, chaquetas, tulas, gorras, canguros) y ve cuánto
// cuesta su pedido y cuánto lleva pagado.
const ProfileMerch = ({ data, onSaved }: Props) => {
  const [prices, setPrices] = useState<MerchPrices | null>(null);

  useEffect(() => {
    getMerchPrices()
      .then(setPrices)
      .catch(() => setPrices(null));
  }, []);

  const total = prices ? computeOrderTotal(data as ServidorRecord, prices as AppSettings) : 0;
  const paid = Number(data.merchPaymentAmount) || 0;

  return (
    <div className="profileSection merchSection" data-tour="merch">
      <h3>Merch 👕</h3>
      <p className="voiceIntro">
        Solicita tu ropa del retiro: elige colores y talla de camiseta y las prendas o accesorios que quieras. Toca un dato para cambiarlo y
        guarda con «Guardar cambios».
      </p>

      {prices && (
        <div className="merchPrices">
          {PRICE_LABELS.map((p) => (
            <span key={p.key} className="merchPrice">
              {p.label} <strong>{formatCOP(prices[p.key])}</strong>
            </span>
          ))}
        </div>
      )}

      <ServidorProfileForm
        sections={["merch"]}
        embedded
        data={data}
        rowLabel="Mi pedido de merch"
        canEditEmail={false}
        save={(field, value) => updateMyServidorField(field, value).then(() => undefined)}
        onSaved={onSaved}
      />

      {prices && (
        <div className="merchTotal">
          <span>
            Total de tu pedido <strong>{formatCOP(total)}</strong>
          </span>
          <span>
            Pagado <strong>{formatCOP(paid)}</strong>
          </span>
          <span className={total - paid > 0 ? "isDue" : "isPaid"}>
            {total - paid > 0 ? (
              <>
                Falta <strong>{formatCOP(total - paid)}</strong>
              </>
            ) : total > 0 ? (
              "¡Pedido pagado!"
            ) : (
              "Aún no has pedido nada"
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfileMerch;

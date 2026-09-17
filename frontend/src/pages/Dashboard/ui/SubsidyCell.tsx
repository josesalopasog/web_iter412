import { useEffect, useState } from "react";
import { formatNumberCO, parseDigits } from "./paymentConfig";

type Props = {
  amount: number;
  max: number;
  onChange: (amount: number) => Promise<void>;
};

const clamp = (n: number, max: number) => Math.min(Math.max(0, Math.round(n)), max);

const SubsidyCell: React.FC<Props> = ({ amount, max, onChange }) => {
  const [draft, setDraft] = useState(amount);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(amount);
  }, [amount]);

  const commit = async () => {
    if (draft === amount) return;
    setIsSaving(true);
    try {
      await onChange(draft);
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Error al guardar el subsidio");
      setDraft(amount);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`subsidyInputGroup ${draft > 0 ? "has-value" : ""}`}>
      <span className="paymentInputPrefix">$</span>
      <input
        className="paymentRowInput"
        type="text"
        inputMode="numeric"
        value={formatNumberCO(draft)}
        disabled={isSaving}
        onChange={(e) => setDraft(clamp(parseDigits(e.target.value), max))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
      />
    </div>
  );
};

export default SubsidyCell;

import { useEffect, useState } from "react";
import { updateMyServidorField } from "../../../api/adminUsers";
import { TESTIMONY_MAX_WORDS, TESTIMONY_MIN_WORDS, countWords } from "../../../api/testimonials";

const MAX_CHARS = 400;

// Tope duro de palabras: si se escribe o pega de más, se conservan solo las primeras 35.
const capWords = (text: string) => {
  if (countWords(text) <= TESTIMONY_MAX_WORDS) return text;
  const match = text.match(new RegExp(`^\\s*(?:\\S+\\s+){${TESTIMONY_MAX_WORDS - 1}}\\S+`));
  return match ? match[0] : text;
};

type Props = {
  initialValue: string;
  onSaved: () => void;
};

const TestimonyEditor = ({ initialValue, onSaved }: Props) => {
  const [value, setValue] = useState(initialValue);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => setValue(initialValue), [initialValue]);

  const words = countWords(value);
  const isEmpty = words === 0;
  const inRange = words >= TESTIMONY_MIN_WORDS && words <= TESTIMONY_MAX_WORDS;
  const dirty = value.trim().replace(/\s+/g, " ") !== initialValue;
  // Vacío también es válido si ya había uno guardado: así se puede retirar de la página principal.
  const canSave = dirty && !saving && (inRange || (isEmpty && !!initialValue));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateMyServidorField("testimony", value);
      setMessage({
        kind: "ok",
        text: isEmpty ? "Testimonio eliminado." : "¡Gracias! Tu testimonio ya puede aparecer en la página principal.",
      });
      onSaved();
    } catch (error) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "No se pudo guardar" });
    } finally {
      setSaving(false);
    }
  };

  const counterClass = isEmpty ? "" : inRange ? " is-ok" : " is-short";

  return (
    <div id="testimonio" className="profileSection testimonyEditor">
      <h3>Cuéntanos tu testimonio</h3>
      <p className="testimonyHint">
        Este testimonio aparece en la página principal. Cuéntale al futuro soldado por qué hacer el retiro de ITER
        en {TESTIMONY_MIN_WORDS} a {TESTIMONY_MAX_WORDS} palabras.
      </p>

      <textarea
        className="testimonyInput"
        value={value}
        maxLength={MAX_CHARS}
        rows={4}
        placeholder="En ITER viví el mejor fin de semana de mi vida…"
        onChange={(e) => {
          setMessage(null);
          setValue(capWords(e.target.value));
        }}
      />

      <div className="testimonyFooter">
        <span className={`testimonyCounter${counterClass}`}>
          {words} / {TESTIMONY_MAX_WORDS} palabras
          {!isEmpty && words < TESTIMONY_MIN_WORDS && ` · faltan ${TESTIMONY_MIN_WORDS - words}`}
        </span>
        <button type="button" className="btnPrimary" disabled={!canSave} onClick={handleSave}>
          {saving ? "Guardando…" : isEmpty && initialValue ? "Eliminar testimonio" : "Guardar testimonio"}
        </button>
      </div>

      {message && <p className={`testimonyMessage is-${message.kind}`}>{message.text}</p>}
    </div>
  );
};

export default TestimonyEditor;

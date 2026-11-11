import { useEffect, useState } from "react";
import {
  VOICE_SPACE_LABELS,
  VOICE_STATUS_LABELS,
  VOICE_TARGET_LABELS,
  VOICE_TYPE_LABELS,
  VOICE_VISIBILITY_LABELS,
  listMyVoice,
  sendVoice,
} from "../../../api/voice";
import type { VoiceEntry, VoiceSpace, VoiceTarget, VoiceType, VoiceVisibility } from "../../../api/voice";

type Option = VoiceType;

const OPTIONS: { value: Option; emoji: string; label: string; intro: string }[] = [
  {
    value: "SUGERENCIA",
    emoji: "📥",
    label: "Sugerencias",
    intro: "Comparte algo que podríamos mejorar o fortalecer: la comunicación, la organización o el ambiente de las reuniones. Desde el respeto y el deseo de construir en unidad.",
  },
  {
    value: "ACTIVIDAD",
    emoji: "🧩",
    label: "Actividades",
    intro: "Propón dinámicas, temas, juegos o reflexiones para las formaciones, o salidas, convivencias y talleres para compartir como comunidad.",
  },
  {
    value: "ORACION",
    emoji: "🙏🏻",
    label: "Oración",
    intro: "Si hay algo por lo que te gustaría que oremos, este es tu espacio. Todas las intenciones se reciben con respeto y confidencialidad.",
  },
];

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }).replace(".", "");

// "Tu voz en ITER": no es un buzón de quejas, sino un espacio para soñar, orar y proponer.
const VoiceForm = () => {
  const [option, setOption] = useState<Option>("SUGERENCIA");
  const [target, setTarget] = useState<VoiceTarget | "">("");
  const [space, setSpace] = useState<VoiceSpace | "">("");
  const [visibility, setVisibility] = useState<VoiceVisibility | "">("");
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mine, setMine] = useState<VoiceEntry[]>([]);

  useEffect(() => {
    listMyVoice()
      .then(setMine)
      .catch(() => setMine([]));
  }, []);

  const current = OPTIONS.find((o) => o.value === option)!;
  const needsTopic = option === "SUGERENCIA" || option === "ACTIVIDAD";
  const canSend =
    text.trim().length > 0 &&
    (!needsTopic || topic.trim().length > 0) &&
    (option !== "ACTIVIDAD" || space !== "") &&
    (option !== "ORACION" || visibility !== "");

  const choose = (value: Option) => {
    setOption(value);
    setMessage(null);
    setError(null);
  };

  const reset = () => {
    setTarget("");
    setSpace("");
    setVisibility("");
    setTopic("");
    setText("");
    setAnonymous(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setIsSending(true);
    setError(null);
    setMessage(null);
    try {
      await sendVoice({
        type: option,
        anonymous,
        target: option === "SUGERENCIA" ? target : undefined,
        space: option === "ACTIVIDAD" ? (space as VoiceSpace) : undefined,
        visibility: option === "ORACION" ? (visibility as VoiceVisibility) : undefined,
        topic: needsTopic ? topic : undefined,
        text,
      });
      setMessage(
        anonymous
          ? "¡Gracias! Lo recibimos de forma anónima: no guardamos quién lo envió."
          : option === "ORACION"
            ? "¡Gracias por confiarnos tu intención! Estaremos orando por ella."
            : "¡Gracias! Lo recibimos y lo vamos a leer con el corazón abierto."
      );
      reset();
      listMyVoice()
        .then(setMine)
        .catch(() => undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo enviar. Intenta de nuevo.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="profileSection voiceSection" id="tu-voz" data-tour="voice">
      <h3>Tu voz en ITER 💚❤️💜</h3>
      <p className="voiceIntro">
        No es un buzón de quejas, sino una puerta abierta para soñar, orar y proponer. Comparte con nosotros lo que pueda fortalecer nuestra
        comunidad.
      </p>

      <div className="voiceOptions" role="radiogroup" aria-label="¿Qué te gustaría compartir hoy?">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={option === o.value}
            className={`voiceOption${option === o.value ? " isSelected" : ""}`}
            onClick={() => choose(o.value)}
          >
            <span className="voiceOptionEmoji" aria-hidden="true">
              {o.emoji}
            </span>
            {o.label}
          </button>
        ))}
      </div>

      <p className="voiceOptionIntro">{current.intro}</p>

      {(
        <form className="voiceForm" onSubmit={submit}>
          {option === "SUGERENCIA" && (
            <fieldset className="voiceChoices">
              <legend>Tu sugerencia va dirigida a</legend>
              {(Object.keys(VOICE_TARGET_LABELS) as VoiceTarget[]).map((t) => (
                <label key={t} className={`voiceChoice${target === t ? " isSelected" : ""}`}>
                  <input type="radio" name="target" checked={target === t} onChange={() => setTarget(t)} />
                  {VOICE_TARGET_LABELS[t]}
                </label>
              ))}
            </fieldset>
          )}

          {option === "ACTIVIDAD" && (
            <fieldset className="voiceChoices">
              <legend>¿Qué tipo de espacio es? *</legend>
              {(Object.keys(VOICE_SPACE_LABELS) as VoiceSpace[]).map((s) => (
                <label key={s} className={`voiceChoice${space === s ? " isSelected" : ""}`}>
                  <input type="radio" name="space" checked={space === s} onChange={() => setSpace(s)} />
                  {VOICE_SPACE_LABELS[s]}
                </label>
              ))}
            </fieldset>
          )}

          {option === "ORACION" && (
            <fieldset className="voiceChoices">
              <legend>¿Quiénes podrán ver tu petición? *</legend>
              {(Object.keys(VOICE_VISIBILITY_LABELS) as VoiceVisibility[]).map((v) => (
                <label key={v} className={`voiceChoice${visibility === v ? " isSelected" : ""}`}>
                  <input type="radio" name="visibility" checked={visibility === v} onChange={() => setVisibility(v)} />
                  <span>
                    {VOICE_VISIBILITY_LABELS[v]}
                    {v === "COMITE" && <small> · se lee en confidencialidad</small>}
                    {v === "COMUNIDAD" && <small> · para que todos oremos contigo</small>}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {needsTopic && (
            <label className="voiceField">
              <span>{option === "SUGERENCIA" ? "¿Cuál es el tema de tu sugerencia? *" : "¿Cuál es el tema de tu idea? *"}</span>
              <input
                type="text"
                maxLength={120}
                placeholder="En una frase corta o palabra"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </label>
          )}

          <label className="voiceField">
            <span>
              {option === "SUGERENCIA"
                ? "Lánzate con tu sugerencia, escríbela lo más detallada que puedas *"
                : option === "ACTIVIDAD"
                  ? "Cuéntanos tu idea con el mayor detalle posible *"
                  : "Comparte tu petición en este espacio *"}
            </span>
            <textarea maxLength={2000} rows={5} value={text} onChange={(e) => setText(e.target.value)} />
            <small className="voiceCounter">{text.length} / 2000</small>
          </label>

          <label className={`voiceAnonymous${anonymous ? " isOn" : ""}`}>
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
            <span>
              <strong>Enviar de forma anónima</strong>
              <small>No guardamos tu nombre ni tu usuario: nadie podrá saber que lo enviaste tú.</small>
            </span>
          </label>

          <div className="voiceActions">
            <button type="submit" className="toolbarButton primary" disabled={!canSend || isSending}>
              {isSending ? "Enviando..." : "Enviar"}
            </button>
            {message && <span className="rateSaved">{message}</span>}
          </div>
          {error && <p className="eventErrorMsg">{error}</p>}
        </form>
      )}

      {mine.length > 0 && (
        <div className="voiceMine">
          <span className="rateBoxTitle">Lo que has compartido con tu nombre</span>
          <ul>
            {mine.slice(0, 5).map((m) => (
              <li key={m._id}>
                <span className="voiceMineType">{VOICE_TYPE_LABELS[m.type]}</span>
                <span className="voiceMineText">{m.topic || m.text}</span>
                <span className={`statusPill ${m.status === "ATENDIDO" ? "completo" : m.status === "LEIDO" ? "info" : "neutral"}`}>
                  {VOICE_STATUS_LABELS[m.status]}
                </span>
                <span className="voiceMineDate">{formatDate(m.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoiceForm;

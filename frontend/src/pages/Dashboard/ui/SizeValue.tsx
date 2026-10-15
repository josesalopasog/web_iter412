import { openParticipantAnswers } from "./participantLink";

type Props = {
  value: string;
  otherAnswer: string;
  documentNumber: string;
  otherField: string;
};

// Talla de camiseta/merch: "OTRO" se muestra como "Otro" (sin importar lo larga que sea la respuesta);
// el hover muestra lo que escribió y el clic abre sus respuestas justo en esa pregunta.
const SizeValue: React.FC<Props> = ({ value, otherAnswer, documentNumber, otherField }) => {
  if (value !== "OTRO") return <>{value || "-"}</>;

  return (
    <button
      type="button"
      className="dbOtherSizeLink"
      title={otherAnswer.trim() || "Sin especificar"}
      onClick={(e) => {
        if (e.detail > 1) return;
        openParticipantAnswers("servidores", documentNumber, otherField);
      }}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      Otro
    </button>
  );
};

export default SizeValue;

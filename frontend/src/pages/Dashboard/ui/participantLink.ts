export const openParticipantAnswers = (
  tipo: "soldados" | "servidores",
  documentNumber: string,
  anchor?: string
) => {
  const documento = documentNumber.trim();
  if (!documento) {
    alert("Este registro no tiene número de documento");
    return;
  }
  const hash = anchor ? `#${anchor}` : "";
  window.open(`/participante/${tipo}/${encodeURIComponent(documento)}${hash}`, "_blank", "noopener");
};

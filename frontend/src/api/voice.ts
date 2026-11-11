import { authedRequest } from "./http";

// "Tu voz en ITER": sugerencias, actividades y peticiones de oración de los servidores.
export type VoiceType = "SUGERENCIA" | "ACTIVIDAD" | "ORACION";
export type VoiceTarget = "COMITE" | "EQUIPO_RETIRO";
export type VoiceSpace = "FORMACION" | "EXTRACURRICULAR";
export type VoiceVisibility = "COMITE" | "COMUNIDAD" | "EQUIPO_RETIRO";
export type VoiceStatus = "NUEVO" | "LEIDO" | "ATENDIDO";

export type VoiceEntry = {
  _id: string;
  type: VoiceType;
  anonymous: boolean;
  userId: string | null;
  userName: string | null;
  userRole: string | null;
  target: VoiceTarget | "";
  space: VoiceSpace | "";
  visibility: VoiceVisibility | "";
  topic: string;
  text: string;
  status: VoiceStatus;
  createdAt: string;
};

export type VoiceInput = {
  type: VoiceType;
  anonymous: boolean;
  target?: VoiceTarget | "";
  space?: VoiceSpace;
  visibility?: VoiceVisibility;
  topic?: string;
  text: string;
};

export const VOICE_TYPE_LABELS: Record<VoiceType, string> = {
  SUGERENCIA: "Sugerencia",
  ACTIVIDAD: "Actividad",
  ORACION: "Oración",
};

export const VOICE_TARGET_LABELS: Record<VoiceTarget, string> = { COMITE: "Comité", EQUIPO_RETIRO: "Equipo de retiro" };
export const VOICE_SPACE_LABELS: Record<VoiceSpace, string> = { FORMACION: "Reunión de formación", EXTRACURRICULAR: "Actividad extracurricular" };
export const VOICE_VISIBILITY_LABELS: Record<VoiceVisibility, string> = {
  COMITE: "Solo el comité",
  COMUNIDAD: "Toda la comunidad",
  EQUIPO_RETIRO: "Equipo de retiro",
};
export const VOICE_STATUS_LABELS: Record<VoiceStatus, string> = { NUEVO: "Nuevo", LEIDO: "Leído", ATENDIDO: "Atendido" };

export const sendVoice = (payload: VoiceInput) =>
  authedRequest<{ _id: string; type: VoiceType; anonymous: boolean; createdAt: string }>("/api/voice", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const listMyVoice = () => authedRequest<VoiceEntry[]>("/api/voice/mine");
export const listVoice = () => authedRequest<VoiceEntry[]>("/api/voice");

export const updateVoiceStatus = (id: string, status: VoiceStatus) =>
  authedRequest<VoiceEntry>(`/api/voice/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });

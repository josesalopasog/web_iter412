import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/errors.js";
import { createLog } from "../activityLog/createLog.js";
import {
  ANONYMOUS_TYPES,
  VOICE_SPACES,
  VOICE_STATUSES,
  VOICE_TARGETS,
  VOICE_TYPES,
  VOICE_VISIBILITY,
  Voice,
  type VoiceType,
} from "./voice.model.js";

const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const oneOf = <T extends readonly string[]>(list: T, value: unknown): value is T[number] =>
  typeof value === "string" && (list as readonly string[]).includes(value);

/** POST /api/voice: un servidor comparte algo (puede ser anónimo según el tipo). */
export const createVoice = asyncHandler(async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  if (!oneOf(VOICE_TYPES, body.type)) throw new ApiError(400, "Elige qué quieres compartir");
  const type = body.type as VoiceType;
  const anonymous = Boolean(body.anonymous) && ANONYMOUS_TYPES.includes(type);

  const topic = text(body.topic, 120);
  const content = text(body.text, 2000);
  if (!content) throw new ApiError(400, "Escribe tu mensaje");

  const entry: Record<string, unknown> = { type, anonymous, text: content };
  if (type === "SUGERENCIA") {
    if (!topic) throw new ApiError(400, "Escribe el tema de tu sugerencia");
    if (body.target !== undefined && body.target !== "" && !oneOf(VOICE_TARGETS, body.target)) throw new ApiError(400, "Destino inválido");
    entry.target = body.target || "";
    entry.topic = topic;
  } else if (type === "ACTIVIDAD") {
    if (!oneOf(VOICE_SPACES, body.space)) throw new ApiError(400, "Elige el tipo de espacio");
    if (!topic) throw new ApiError(400, "Escribe el tema de tu idea");
    entry.space = body.space;
    entry.topic = topic;
  } else if (type === "ORACION") {
    if (!oneOf(VOICE_VISIBILITY, body.visibility)) throw new ApiError(400, "Elige quiénes podrán ver tu petición");
    entry.visibility = body.visibility;
  }

  if (!anonymous) {
    const user = req.user!;
    entry.userId = user.sub;
    entry.userName = `${user.firstNames} ${user.lastNames}`;
    entry.userRole = user.role;
  }

  const created = await Voice.create(entry);
  res.status(201).json({ _id: String(created._id), type: created.type, anonymous: created.anonymous, createdAt: created.createdAt });
});

/** GET /api/voice/mine: lo que envió el servidor con su nombre (lo anónimo no se puede rastrear). */
export const listMyVoice = asyncHandler(async (req, res) => {
  const entries = await Voice.find({ userId: req.user!.sub }).sort({ createdAt: -1 }).limit(30).lean();
  res.json(entries);
});

/** GET /api/voice: todas las respuestas (dashboard). */
export const listVoice = asyncHandler(async (_req, res) => {
  const entries = await Voice.find().sort({ createdAt: -1 }).limit(1000).lean();
  res.json(entries);
});

/** PATCH /api/voice/:id/status  { status: NUEVO | LEIDO | ATENDIDO } */
export const updateVoiceStatus = asyncHandler(async (req, res) => {
  const { status } = (req.body ?? {}) as { status?: unknown };
  if (!oneOf(VOICE_STATUSES, status)) throw new ApiError(400, "Estado inválido");
  const entry = await Voice.findById(req.params.id);
  if (!entry) throw new ApiError(404, "No encontrado");
  entry.status = status;
  await entry.save();
  await createLog(req.user!, "TU_VOZ_ESTADO", `Marcó como ${status.toLowerCase()} un mensaje de "Tu voz" (${entry.type.toLowerCase()})`);
  res.json(entry);
});

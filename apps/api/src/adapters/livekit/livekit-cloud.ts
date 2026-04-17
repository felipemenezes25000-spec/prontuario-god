/**
 * LiveKit Cloud — produção.
 *
 * LiveKit usa JWT HS256 com payload:
 *   { iss: API_KEY, nbf, exp, sub: identity, video: { room, roomJoin, canPublish, canSubscribe } }
 *
 * Este adapter emite os tokens direto (sem SDK livekit-server) para manter deps leves.
 * Em produção você pode usar `livekit-server-sdk` (RoomService + Egress) para:
 * - Iniciar gravação composite
 * - Listar participantes em tempo real
 * - Kick participant se necessário (compliance)
 */
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import type { LivekitAdapter, CriarSessaoInput, SessaoSalaResultado } from "./types.js";
import { env } from "../../env.js";

function signLivekitToken(params: {
  identity: string;
  room: string;
  ttlSeconds: number;
  canPublish: boolean;
  canSubscribe: boolean;
}): string {
  if (!env.LIVEKIT_API_KEY || !env.LIVEKIT_API_SECRET) {
    throw new Error("LIVEKIT_API_KEY e LIVEKIT_API_SECRET obrigatórios em LIVEKIT_ADAPTER=livekit_cloud");
  }
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: env.LIVEKIT_API_KEY,
    sub: params.identity,
    nbf: now,
    exp: now + params.ttlSeconds,
    video: {
      room: params.room,
      roomJoin: true,
      canPublish: params.canPublish,
      canSubscribe: params.canSubscribe,
    },
  };
  return jwt.sign(payload, env.LIVEKIT_API_SECRET, { algorithm: "HS256" });
}

export const livekitCloudAdapter: LivekitAdapter = {
  async criarSessao(input: CriarSessaoInput): Promise<SessaoSalaResultado> {
    if (!env.LIVEKIT_URL) {
      throw new Error("LIVEKIT_URL obrigatório para livekit_cloud adapter");
    }
    const room_name = `meridiana-${input.telemed_session_id}`;
    const ttl = input.duracao_minutos * 60;

    const token_medico = signLivekitToken({
      identity: `medico:${input.medico_user_id}`,
      room: room_name,
      ttlSeconds: ttl,
      canPublish: true,
      canSubscribe: true,
    });
    const token_paciente = signLivekitToken({
      identity: `paciente:${input.paciente_user_id}`,
      room: room_name,
      ttlSeconds: ttl,
      canPublish: true,
      canSubscribe: true,
    });

    return {
      room_name,
      room_sid: `rs_${randomUUID()}`,
      url: env.LIVEKIT_URL,
      token_medico,
      token_paciente,
      expira_em: new Date(Date.now() + ttl * 1000).toISOString(),
    };
  },

  async finalizarSessao(_room_name) {
    // TODO: chamar RoomService.deleteRoom via REST
    return { ok: true };
  },

  async obterGravacao(_room_sid) {
    // TODO: integrar com LiveKit Egress API
    return { status: "processando" };
  },
};

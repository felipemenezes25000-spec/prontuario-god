import { randomUUID } from "node:crypto";
import type { LivekitAdapter, CriarSessaoInput, SessaoSalaResultado } from "./types.js";

export const livekitMockAdapter: LivekitAdapter = {
  async criarSessao(input: CriarSessaoInput): Promise<SessaoSalaResultado> {
    const room_name = `meridiana-${input.telemed_session_id}`;
    const expira = new Date(Date.now() + input.duracao_minutos * 60_000).toISOString();
    return {
      room_name,
      room_sid: `mock-${randomUUID()}`,
      url: "https://mock.meridiana.livekit.local",
      token_medico: `mock-lk-medico-${randomUUID()}`,
      token_paciente: `mock-lk-paciente-${randomUUID()}`,
      expira_em: expira,
    };
  },

  async finalizarSessao(_room_name) {
    return { ok: true, gravacao_url: "https://mock.meridiana.storage/livekit/recordings/mock.mp4" };
  },

  async obterGravacao(_room_sid) {
    return { url: "https://mock.meridiana.storage/livekit/recordings/mock.mp4", status: "disponivel" };
  },
};

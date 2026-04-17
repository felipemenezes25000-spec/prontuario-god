import type { WhatsappAdapter, EnviarTemplateInput, ResultadoEnvio } from "./types.js";

const enviadas: Array<EnviarTemplateInput & { sent_at: string; message_id: string }> = [];

export const whatsappMockAdapter: WhatsappAdapter = {
  async enviarTemplate(input): Promise<ResultadoEnvio> {
    const message_id = `mock-wa-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    enviadas.push({ ...input, sent_at: new Date().toISOString(), message_id });
    return {
      sucesso: true,
      provider_message_id: message_id,
      status: "enviada",
    };
  },

  verificarWebhook(mode, token, challenge) {
    if (mode === "subscribe" && token === "mock-verify-token") return challenge;
    return null;
  },

  async processarWebhook(_body) {
    // mock: no-op
  },
};

export function mockInspecionarEnviadas(): ReadonlyArray<(typeof enviadas)[number]> {
  return enviadas;
}

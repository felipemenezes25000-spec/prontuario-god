/**
 * Meta Cloud API — WhatsApp Business oficial.
 *
 * Pré-requisitos que VOCÊ precisa providenciar antes:
 * 1. Conta Meta Business + app WhatsApp Business
 * 2. Número aprovado + WABA (WhatsApp Business Account) ID
 * 3. Access token (long-lived) ou system user token
 * 4. Templates submetidos e aprovados (cada template = 1-3 dias)
 * 5. Webhook URL + verify_token configurados
 *
 * Este adapter faz HTTPS direto (sem SDK Meta — que é Node-only desatualizado).
 */
import type { WhatsappAdapter, EnviarTemplateInput, ResultadoEnvio } from "./types.js";
import { env } from "../../env.js";

const API_BASE = "https://graph.facebook.com/v20.0";

export const whatsappMetaCloudAdapter: WhatsappAdapter = {
  async enviarTemplate(input): Promise<ResultadoEnvio> {
    if (!env.WHATSAPP_PHONE_ID || !env.WHATSAPP_ACCESS_TOKEN) {
      return {
        sucesso: false,
        status: "falhou",
        erro: "WHATSAPP_PHONE_ID e WHATSAPP_ACCESS_TOKEN não configurados",
      };
    }

    const body = {
      messaging_product: "whatsapp",
      to: input.destinatario_e164.replace(/^\+/, ""),
      type: "template",
      template: {
        name: input.template,
        language: { code: input.idioma },
        components:
          input.parametros.length > 0
            ? [
                {
                  type: "body",
                  parameters: input.parametros.map((p) => ({ type: "text", text: p })),
                },
              ]
            : undefined,
      },
    };

    try {
      const resp = await fetch(`${API_BASE}/${env.WHATSAPP_PHONE_ID}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const json = (await resp.json()) as { messages?: Array<{ id: string }>; error?: { message: string } };
      if (!resp.ok) {
        return { sucesso: false, status: "falhou", erro: json.error?.message ?? `HTTP ${resp.status}`, raw: json };
      }
      const result: ResultadoEnvio = {
        sucesso: true,
        status: "enviada",
        raw: json,
      };
      const msgId = json.messages?.[0]?.id;
      if (msgId) result.provider_message_id = msgId;
      return result;
    } catch (err) {
      return {
        sucesso: false,
        status: "falhou",
        erro: err instanceof Error ? err.message : String(err),
      };
    }
  },

  verificarWebhook(mode, token, challenge) {
    if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
      return challenge;
    }
    return null;
  },

  async processarWebhook(_body) {
    // TODO(produção): parse statuses + messages do payload Meta
    // Atualizar Mensagem.status conforme delivery/read receipts chegam
    // Lidar com mensagens recebidas → rotear para M4 (tracker) se template conhecido
  },
};

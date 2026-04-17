/**
 * Telemedicina — provider de vídeo (LiveKit default).
 *
 * Por que LiveKit?
 * - Self-host em infra BR para LGPD-residency (DO / Magalu Cloud / Oracle BR)
 * - E2EE opcional (DataPacket_Kind=LOSSLESS + encryption key)
 * - Gravação server-side com upload direto p/ S3/R2
 * - SDK web + iOS + Android maduros
 * - Preço: self-host ~R$ 200/mês p/ 100 horas; LiveKit Cloud ~US$ 50 mínimo
 *
 * Alternativas: Vonage, Twilio Video (USA — LGPD residência fora BR), Daily, 100ms.
 *
 * Tokens LiveKit são JWT HS256 assinados com API_SECRET. Contém:
 * - room (nome da sala)
 * - identity (quem é o participante — user_id do Medico/Paciente)
 * - grants (canPublish, canSubscribe, roomAdmin, recordingAccess)
 * - ttl (~2h para telemedicina)
 */

export interface CriarSessaoInput {
  medico_user_id: string;
  paciente_user_id: string;
  telemed_session_id: string;
  duracao_minutos: number;
  gravar: boolean;
}

export interface SessaoSalaResultado {
  room_name: string;
  room_sid?: string;
  url: string;                          // URL da sala (ex: https://meridiana.livekit.cloud)
  token_medico: string;                 // JWT pré-assinado p/ médico
  token_paciente: string;               // JWT pré-assinado p/ paciente
  expira_em: string;                    // ISO
}

export interface LivekitAdapter {
  criarSessao(input: CriarSessaoInput): Promise<SessaoSalaResultado>;
  finalizarSessao(room_name: string): Promise<{ ok: boolean; gravacao_url?: string }>;
  obterGravacao(room_sid: string): Promise<{ url?: string; status: "disponivel" | "processando" | "nao_encontrada" }>;
}

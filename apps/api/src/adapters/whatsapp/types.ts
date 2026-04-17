/**
 * WhatsApp Business — envio de mensagens a pacientes.
 *
 * Contexto:
 * - Meta Cloud API (graph.facebook.com/v18.0) é o provider oficial
 * - Templates precisam ser submetidos e aprovados (24-72h) antes de uso
 * - Fora do HSM (template) só é possível mensagem dentro de janela 24h após paciente iniciar
 *
 * Templates relevantes para cannabis medicinal:
 * - lembrete_dose (M4 tracker): "Olá {{1}}, hora da sua dose de {{2}}mg. Registrar aqui: {{3}}"
 * - alerta_660_vencendo (M3): "Seu ofício RDC 660 vence em 30d, clique para renovar"
 * - relatorio_semanal (M4): "Dra. {{1}} enviou seu relatório de {{2}}"
 * - titulacao_upgrade (M1): "Próxima semana: ajuste de dose para {{1}}mg"
 *
 * Compliance LGPD:
 * - Só enviar com consentimento finalidade=telemedicina ou =prestacao_assistencia
 * - Nunca template marketing sem consentimento_marketing
 * - Audit log de cada envio (Mensagem model)
 */

export type TemplateName =
  | "lembrete_dose"
  | "alerta_660_vencendo"
  | "relatorio_semanal"
  | "titulacao_upgrade"
  | "confirmacao_consulta"
  | "receita_pronta";

export interface EnviarTemplateInput {
  destinatario_e164: string;        // "+5511999998888"
  template: TemplateName;
  idioma: string;                    // "pt_BR"
  parametros: string[];              // substitui {{1}}, {{2}}...
  paciente_id?: string;
}

export interface ResultadoEnvio {
  sucesso: boolean;
  provider_message_id?: string;
  status: "pendente" | "enviada" | "rejeitada" | "falhou";
  erro?: string;
  raw?: unknown;
}

export interface WhatsappAdapter {
  enviarTemplate(input: EnviarTemplateInput): Promise<ResultadoEnvio>;

  /** Valida assinatura do webhook Meta (hub.verify_token) */
  verificarWebhook(mode: string, token: string, challenge: string): string | null;

  /** Processa payload de status (delivered, read) ou mensagem recebida */
  processarWebhook(body: unknown): Promise<void>;
}

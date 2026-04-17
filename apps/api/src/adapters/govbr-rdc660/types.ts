/**
 * ANVISA RDC 660/2022 — importação excepcional de cannabis medicinal.
 *
 * Processo atual (2026):
 * - Médico gera ofício pré-preenchido (PDF) + laudo
 * - Paciente assina + junta RG/CPF/comprovante
 * - Submissão via gov.br (SEI!) ou canal ANVISA específico
 * - Tempo de deferimento: 7-15 dias úteis
 * - Validade: 2 anos (ainda não há renovação automática pela ANVISA)
 *
 * Automação possível:
 * - Geração do ofício (Meridiana já faz via M3)
 * - Submissão programática: NÃO há API oficial. É peticionamento manual no SEI.
 * - Tracking: ANVISA publica deferimentos em diário oficial — podemos fazer pull-scraping
 *   + consultar CPF do paciente no sistema de consulta pública
 *
 * Em produção: este adapter gera PDFs, empacota documentação, e produz um "pacote submissão"
 * que o paciente (ou secretária da clínica) baixa e submete manualmente no SEI/gov.br.
 *
 * O STATUS então é atualizado por:
 * 1. Secretária da clínica marca manualmente
 * 2. Worker que consulta diário oficial + alerta quando nome aparece
 */

export interface PacoteSubmissao660 {
  prescricao_id: string;
  oficio_pdf_url: string;
  laudo_pdf_url?: string;
  paciente_rg_sha256?: string; // hash do doc (não o doc) — LGPD minimization
  instrucoes_paciente: string;
}

export interface StatusConsulta {
  protocolo_gov?: string;
  situacao: "aguardando_submissao" | "submetido" | "em_analise" | "deferido" | "indeferido";
  data_decisao?: string;
  validade_ate?: string;
  observacao?: string;
  consultado_em: string;
}

export interface GovbrRdc660Adapter {
  montarPacote(prescricao_id: string): Promise<PacoteSubmissao660>;
  consultarStatus(protocolo_gov: string): Promise<StatusConsulta>;
  consultarPorCpf(cpf: string): Promise<StatusConsulta[]>;
}

import type { GovbrRdc660Adapter, PacoteSubmissao660, StatusConsulta } from "./types.js";

export const govbrMockAdapter: GovbrRdc660Adapter = {
  async montarPacote(prescricao_id): Promise<PacoteSubmissao660> {
    return {
      prescricao_id,
      oficio_pdf_url: `https://mock.meridiana.storage/oficios/${prescricao_id}.pdf`,
      laudo_pdf_url: `https://mock.meridiana.storage/laudos/${prescricao_id}.pdf`,
      instrucoes_paciente:
        "1) Acesse gov.br → SEI peticionamento. 2) Selecione tipo 'Importação RDC 660'. 3) Anexe ofício e laudo. 4) Inclua RG + CPF + comprovante de residência. 5) Protocolo será emitido na hora.",
    };
  },

  async consultarStatus(protocolo_gov: string): Promise<StatusConsulta> {
    const par = protocolo_gov.replace(/\D/g, "").endsWith("0");
    const result: StatusConsulta = {
      protocolo_gov,
      situacao: par ? "deferido" : "em_analise",
      observacao: par ? "Deferimento automático mock" : "Em análise há 5 dias",
      consultado_em: new Date().toISOString(),
    };
    if (par) {
      result.data_decisao = new Date(Date.now() - 86400_000).toISOString();
      result.validade_ate = new Date(Date.now() + 2 * 365 * 86400_000).toISOString();
    }
    return result;
  },

  async consultarPorCpf(_cpf: string) {
    return [];
  },
};

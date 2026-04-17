/**
 * CFM (Conselho Federal de Medicina) — validação de CRM.
 *
 * Por que adapter? O CFM não tem API pública oficial:
 * - portal.cfm.org.br expõe dados via form público (scraping autorizado p/ consulta individual)
 * - Algumas empresas (JotForm, Validoc, Docusign) oferecem serviços pagos wrappando isso
 * - Em roadmap, integração com CRMs estaduais (CRM-SP tem API limitada)
 *
 * Implementações possíveis:
 * - mock (dev)
 * - cfm_portal_scraper (produção — com rate limit + cache 30d)
 *
 * A verificação deve rodar:
 * - No signup de médico (bloqueia se cassado/suspenso)
 * - Em cron mensal (re-verifica cohort ativa)
 * - Antes de cada prescrição tipo A (crítico)
 */

export interface CrmStatus {
  numero: string;
  uf: string;
  nome_completo: string;
  situacao: "ativo" | "suspenso" | "cassado" | "nao_encontrado";
  especialidades: string[];
  data_inscricao?: string;
  verificado_em: string; // ISO timestamp
  fonte: "cfm_portal" | "mock" | "cache";
  raw?: unknown;
}

export interface CfmAdapter {
  /** Consulta CRM+UF. Deve ter cache de 30d p/ não derrubar portal do CFM. */
  consultar(numero: string, uf: string): Promise<CrmStatus>;
}

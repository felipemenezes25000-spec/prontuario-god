/**
 * CFM Portal Scraper — implementação de produção.
 *
 * ATENÇÃO JURÍDICA:
 * - O CFM permite consulta pública individual via portal.cfm.org.br
 * - Scraping em massa viola termos; só consulta individual cacheada 30d
 * - Use User-Agent identificando sua aplicação (transparência)
 * - Backoff em 429; circuit breaker se portal ficar offline
 *
 * Este esqueleto deixa clara a estrutura. A implementação full precisa:
 * - HTML parsing (cheerio ou similar)
 * - Captcha manual se aparecer (deixar job em DLQ para DPO resolver)
 * - Armazenar `raw` HTML por 90d p/ auditoria
 */
import type { CfmAdapter, CrmStatus } from "./types.js";

export const cfmPortalScraperAdapter: CfmAdapter = {
  async consultar(numero: string, uf: string): Promise<CrmStatus> {
    // TODO(produção): implementar fetch + parser
    // const url = `https://portal.cfm.org.br/crm-medico/consulta?crm=${numero}&uf=${uf}`;
    // const html = await fetch(url, { headers: { "User-Agent": "Meridiana/1.0 (contato@meridiana.health)" } }).then(r => r.text());
    // const $ = cheerio.load(html);
    // ...
    throw new Error(
      "cfmPortalScraperAdapter não implementado. Defina CFM_ADAPTER=mock ou integre um provider pago (Validoc/JotForm).",
    );
  },
};

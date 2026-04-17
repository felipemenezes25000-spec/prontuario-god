/**
 * @meridiana/pii-redactor
 *
 * Pipeline obrigatório: redação local de PII antes de qualquer chamada a LLM externo.
 * Conformidade LGPD — dados de saúde sensíveis (art. 5, II) nunca saem sem mascaramento.
 *
 * Uso:
 *   const r = new PiiRedactor({ ollama: { baseUrl, model } });
 *   const { redacted, mapping } = await r.redact("Paciente João da Silva, CPF 123.456.789-00...");
 *   // → "Paciente [NOME_001], CPF [CPF_001]..."
 *   // ... chama LLM externo com `redacted` ...
 *   const final = r.rehydrate(llmResponse, mapping);
 */
import { RULES, type PiiCategory } from "./regex-br.js";
import { llmRedact } from "./llm-fallback.js";

export interface PiiRedactorOptions {
  /** Configuração para 2ª passada via Llama local (opcional) */
  ollama?: {
    baseUrl: string;
    model: string;
  };
  /** Habilita 2ª passada (default true se ollama presente) */
  useLlmPass?: boolean;
}

export interface RedactionMapping {
  /** placeholder -> valor original */
  reverse: Record<string, string>;
  /** valor original -> placeholder (para deduplicar) */
  forward: Record<string, string>;
  /** contadores por categoria */
  counters: Record<string, number>;
}

export interface RedactResult {
  redacted: string;
  mapping: RedactionMapping;
  /** Quantidade de spans encontrados por categoria */
  stats: Record<string, number>;
}

export class PiiRedactor {
  constructor(private readonly opts: PiiRedactorOptions = {}) {}

  /**
   * Redige PII no texto. Retorna texto mascarado + mapeamento para rehidratar depois.
   */
  async redact(text: string): Promise<RedactResult> {
    const mapping: RedactionMapping = {
      reverse: {},
      forward: {},
      counters: {},
    };
    const stats: Record<string, number> = {};

    let working = text;

    // 1ª passada: regex BR
    for (const rule of RULES) {
      working = working.replace(rule.pattern, (match) => {
        if (rule.validate && !rule.validate(match)) return match;
        const placeholder = this.getOrCreatePlaceholder(rule.category, match, mapping);
        stats[rule.category] = (stats[rule.category] ?? 0) + 1;
        return placeholder;
      });
    }

    // 2ª passada: Llama local (opcional)
    const useLlm = this.opts.useLlmPass !== false && this.opts.ollama;
    if (useLlm && this.opts.ollama) {
      const result = await llmRedact({
        text: working,
        baseUrl: this.opts.ollama.baseUrl,
        model: this.opts.ollama.model,
      });

      // Aplica spans em ordem reversa para preservar índices
      const sorted = [...result.spans].sort((a, b) => b.start - a.start);
      for (const span of sorted) {
        const original = working.slice(span.start, span.end);
        const placeholder = this.getOrCreatePlaceholder(
          (span.category || "OUTRO") as PiiCategory,
          original,
          mapping,
        );
        working = working.slice(0, span.start) + placeholder + working.slice(span.end);
        stats[span.category] = (stats[span.category] ?? 0) + 1;
      }
    }

    return { redacted: working, mapping, stats };
  }

  /**
   * Re-hidrata um texto trocando placeholders pelos valores originais.
   * Use APENAS após receber resposta do LLM externo, antes de devolver ao usuário.
   */
  rehydrate(text: string, mapping: RedactionMapping): string {
    let working = text;
    for (const [placeholder, original] of Object.entries(mapping.reverse)) {
      working = working.split(placeholder).join(original);
    }
    return working;
  }

  private getOrCreatePlaceholder(
    category: string,
    value: string,
    mapping: RedactionMapping,
  ): string {
    const cleaned = value.trim();
    if (mapping.forward[cleaned]) return mapping.forward[cleaned];

    const idx = (mapping.counters[category] ?? 0) + 1;
    mapping.counters[category] = idx;
    const placeholder = `[${category}_${String(idx).padStart(3, "0")}]`;

    mapping.forward[cleaned] = placeholder;
    mapping.reverse[placeholder] = cleaned;
    return placeholder;
  }
}

export { RULES, validaCpf } from "./regex-br.js";
export type { PiiCategory } from "./regex-br.js";

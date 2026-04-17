/**
 * Regex para PII brasileira. Primeira passada do redactor (rápida, determinística).
 * Segunda passada (nomes próprios via LLM) está em llm-fallback.ts.
 */

export interface RedactionRule {
  /** Categoria do placeholder, ex: CPF, EMAIL */
  category: PiiCategory;
  /** Regex global */
  pattern: RegExp;
  /** Validador opcional (ex: dígitos verificadores CPF) */
  validate?: (match: string) => boolean;
}

export type PiiCategory =
  | "CPF"
  | "RG"
  | "CNS"
  | "CRM"
  | "TELEFONE"
  | "CEP"
  | "EMAIL"
  | "DATA_NASC"
  | "CNPJ"
  | "PIS";

export const RULES: RedactionRule[] = [
  {
    category: "CPF",
    // 999.999.999-99 ou 99999999999
    pattern: /\b(\d{3}\.?\d{3}\.?\d{3}-?\d{2})\b/g,
    validate: validaCpf,
  },
  {
    category: "CNPJ",
    pattern: /\b(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2})\b/g,
  },
  {
    category: "CNS",
    // Cartão Nacional de Saúde — 15 dígitos, começa com 1, 2, 7, 8 ou 9
    pattern: /\b([12789]\d{14})\b/g,
  },
  {
    category: "RG",
    // RG-SP 99.999.999-9 e variantes (formato heurístico, valida tamanho 8-9 digitos)
    pattern: /\b(\d{1,2}\.?\d{3}\.?\d{3}-?[\dxX])\b/g,
  },
  {
    category: "CRM",
    // CRM/UF 12345
    pattern: /\b(?:CRM[\s/-]?[A-Z]{2}[\s:-]?\d{4,7})\b/gi,
  },
  {
    category: "TELEFONE",
    // (11) 99999-9999, 11 999999999, +55 11..., 1199999999
    pattern: /(?:\+?55[\s-]?)?(?:\(?\d{2}\)?[\s-]?)?9?\d{4}[\s-]?\d{4}\b/g,
  },
  {
    category: "CEP",
    pattern: /\b\d{5}-?\d{3}\b/g,
  },
  {
    category: "EMAIL",
    pattern: /\b[\w._%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  },
  {
    category: "DATA_NASC",
    // dd/mm/yyyy ou dd-mm-yyyy ou yyyy-mm-dd
    pattern: /\b(?:\d{2}[/-]\d{2}[/-]\d{4}|\d{4}-\d{2}-\d{2})\b/g,
  },
  {
    category: "PIS",
    pattern: /\b\d{3}\.?\d{5}\.?\d{2}-?\d\b/g,
  },
];

/** Valida CPF via dígitos verificadores. Reduz falso-positivos do regex. */
export function validaCpf(input: string): boolean {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // Todos iguais

  const calc = (slice: string, factor: number): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      sum += Number.parseInt(slice[i] ?? "0", 10) * (factor - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calc(digits.slice(0, 9), 10);
  const d2 = calc(digits.slice(0, 10), 11);
  return d1 === Number.parseInt(digits[9] ?? "x", 10) && d2 === Number.parseInt(digits[10] ?? "x", 10);
}

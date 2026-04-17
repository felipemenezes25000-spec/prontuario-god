import type { z } from "zod";

/** Nome da tarefa — driver da seleção de modelo. Mapeia 1:1 com docs/architecture/02-ai-routing-policy.md */
export type TaskName =
  | "titulacao.recommend"
  | "titulacao.explain_to_patient"
  | "soap.structure"
  | "tracker.insights_weekly"
  | "consulta.brief"
  | "logistics.ocr"
  | "marketplace.bula_to_lay"
  | "cohort.narrative_insight"
  | "sms.parse"
  | "regulacao.diff"
  | "petition.draft";

export type Tier = "default" | "premium";

export interface InvokeArgs<TSchema extends z.ZodTypeAny | undefined> {
  task: TaskName;
  tier?: Tier;
  /** Para budget guard por paciente/mês */
  patientId?: string;
  systemPrompt: string;
  userPrompt: string;
  /** Schema Zod opcional para forçar saída estruturada (JSON) */
  schema?: TSchema;
  /** Para cache de prompt — se prompt longo/estável, passe `cacheable: true` */
  cacheable?: boolean;
  /** Metadados livres para audit log */
  metadata?: Record<string, unknown>;
}

export interface InvokeResult<T> {
  data: T;
  /** Modelo efetivamente usado (após failovers) */
  model: string;
  provider: ProviderName;
  cost_brl: number;
  latency_ms: number;
  cache_hit: boolean;
  /** Se rota fez fallback */
  fallback_used: boolean;
  /** Mensagem livre (debug) */
  notes?: string;
}

export type ProviderName = "gemini" | "openai" | "ollama" | "mock";

export interface ProviderInvokeArgs {
  systemPrompt: string;
  userPrompt: string;
  /** JSON Schema (já convertido) para structured output */
  jsonSchema?: Record<string, unknown>;
  cacheable: boolean;
  /** Modelo específico para forçar */
  model: string;
}

export interface ProviderResponse {
  text: string;
  prompt_tokens: number;
  completion_tokens: number;
  cache_hit: boolean;
}

export interface Provider {
  name: ProviderName;
  invoke(args: ProviderInvokeArgs): Promise<ProviderResponse>;
  isConfigured(): boolean;
}

/** Tabela de roteamento — task → modelo → custo por 1K tokens (BRL) */
export interface RouteSpec {
  primary: { provider: ProviderName; model: string };
  premium?: { provider: ProviderName; model: string };
  fallback?: { provider: ProviderName; model: string };
  /** Custo aproximado por 1K tokens de output (BRL) — para budget guard */
  cost_per_1k_output_brl: number;
  /** Custo aprox por 1K tokens input (BRL) */
  cost_per_1k_input_brl: number;
  /** Se true, prompts longos têm cache benefit */
  supports_cache: boolean;
}

export class BudgetExceededError extends Error {
  constructor(
    public patientId: string,
    public spent_brl: number,
    public limit_brl: number,
  ) {
    super(
      `Budget de IA excedido para paciente ${patientId}: R$ ${spent_brl.toFixed(3)} / R$ ${limit_brl.toFixed(2)}`,
    );
    this.name = "BudgetExceededError";
  }
}

export class ProviderUnavailableError extends Error {
  constructor(
    public provider: ProviderName,
    cause?: unknown,
  ) {
    super(`Provedor ${provider} indisponível`);
    this.name = "ProviderUnavailableError";
    if (cause) this.cause = cause;
  }
}

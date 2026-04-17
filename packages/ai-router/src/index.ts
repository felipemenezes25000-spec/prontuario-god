/**
 * @meridiana/ai-router
 *
 * Roteador de modelos cheap-first com budget guard, fallback automático e structured output.
 * Veja docs/architecture/02-ai-routing-policy.md para a política completa.
 */
import type { z } from "zod";
import { GeminiProvider } from "./providers/gemini.js";
import { OpenAIProvider } from "./providers/openai.js";
import { MockProvider } from "./providers/mock.js";
import { ROUTING_TABLE } from "./routing-table.js";
import { InMemoryBudgetStore } from "./budget.js";
import {
  BudgetExceededError,
  ProviderUnavailableError,
  type InvokeArgs,
  type InvokeResult,
  type Provider,
  type ProviderName,
} from "./types.js";

export interface AIRouterOptions {
  geminiApiKey?: string | undefined;
  openaiApiKey?: string | undefined;
  /** Limite hard-stop em R$ por paciente / mês */
  hardStopBrlPerPatientMonth?: number;
  /** Limite "soft" — passa de aviso */
  softLimitBrlPerPatientMonth?: number;
  /** Logger callback. No POC apenas console.log */
  onAuditLog?: (entry: AuditLogEntry) => void;
}

export interface AuditLogEntry {
  task: string;
  model: string;
  provider: ProviderName;
  cost_brl: number;
  latency_ms: number;
  cache_hit: boolean;
  fallback_used: boolean;
  patient_id?: string;
  prompt_hash: string;
  response_hash: string;
  ts: string;
}

export class AIRouter {
  private readonly providers: Record<ProviderName, Provider>;
  private readonly budget: InMemoryBudgetStore;
  private readonly hardStop: number;
  private readonly softLimit: number;
  private readonly onAuditLog?: (entry: AuditLogEntry) => void;

  constructor(opts: AIRouterOptions = {}) {
    this.providers = {
      gemini: new GeminiProvider(opts.geminiApiKey ?? "", "gemini-2.5-flash-lite"),
      openai: new OpenAIProvider(opts.openaiApiKey ?? "", "gpt-4o-mini"),
      ollama: new MockProvider(),
      mock: new MockProvider(),
    };
    this.budget = new InMemoryBudgetStore();
    this.hardStop = opts.hardStopBrlPerPatientMonth ?? 3.0;
    this.softLimit = opts.softLimitBrlPerPatientMonth ?? 2.5;
    if (opts.onAuditLog) this.onAuditLog = opts.onAuditLog;
  }

  async invoke<TSchema extends z.ZodTypeAny | undefined>(
    args: InvokeArgs<TSchema>,
  ): Promise<InvokeResult<TSchema extends z.ZodTypeAny ? z.infer<TSchema> : string>> {
    const t0 = Date.now();
    const route = ROUTING_TABLE[args.task];

    // 1) Budget pre-check
    if (args.patientId) {
      const spent = this.budget.get(args.patientId);
      if (spent >= this.hardStop) {
        throw new BudgetExceededError(args.patientId, spent, this.hardStop);
      }
    }

    // 2) Resolve provider/model — primary, premium, fallback
    const tier = args.tier ?? "default";
    const target = tier === "premium" && route.premium ? route.premium : route.primary;
    const fallback = route.fallback;

    // 3) Schema → JSON Schema (Gemini/OpenAI compatível)
    const jsonSchema = args.schema ? zodToJsonSchema(args.schema) : undefined;

    // 4) Tenta primary, falha → fallback
    let providerName: ProviderName = target.provider;
    let modelUsed = target.model;
    let fallbackUsed = false;

    let primaryProvider = this.providers[providerName];
    if (!primaryProvider.isConfigured()) {
      // Sem key — usa mock (dev sem credenciais)
      providerName = "mock";
      primaryProvider = this.providers.mock;
    }

    let response;
    try {
      response = await primaryProvider.invoke({
        systemPrompt: args.systemPrompt,
        userPrompt: args.userPrompt,
        ...(jsonSchema !== undefined ? { jsonSchema } : {}),
        cacheable: args.cacheable ?? false,
        model: modelUsed,
      });
    } catch (err) {
      if (!(err instanceof ProviderUnavailableError) || !fallback) throw err;

      const fbProvider = this.providers[fallback.provider];
      if (!fbProvider.isConfigured()) {
        // Cai para mock se fallback também não configurado
        providerName = "mock";
        modelUsed = "mock-fallback";
        response = await this.providers.mock.invoke({
          systemPrompt: args.systemPrompt,
          userPrompt: args.userPrompt,
          ...(jsonSchema !== undefined ? { jsonSchema } : {}),
          cacheable: false,
          model: "mock",
        });
      } else {
        providerName = fallback.provider;
        modelUsed = fallback.model;
        response = await fbProvider.invoke({
          systemPrompt: args.systemPrompt,
          userPrompt: args.userPrompt,
          ...(jsonSchema !== undefined ? { jsonSchema } : {}),
          cacheable: args.cacheable ?? false,
          model: modelUsed,
        });
      }
      fallbackUsed = true;
    }

    // 5) Calcular custo aprox
    const costInput = (response.prompt_tokens / 1000) * route.cost_per_1k_input_brl;
    const costOutput = (response.completion_tokens / 1000) * route.cost_per_1k_output_brl;
    const cost_brl = providerName === "mock" ? 0 : costInput + costOutput;

    // 6) Atualiza budget se patientId
    if (args.patientId && cost_brl > 0) {
      const newSpent = this.budget.add(args.patientId, cost_brl);
      if (newSpent >= this.softLimit) {
        // Soft warn — emitido via audit log; consumidor decide alertar DPO/médico
        this.audit({
          task: `budget.soft_warning:${args.task}`,
          model: modelUsed,
          provider: providerName,
          cost_brl: 0,
          latency_ms: 0,
          cache_hit: false,
          fallback_used: false,
          patient_id: args.patientId,
          prompt_hash: "",
          response_hash: "",
          ts: new Date().toISOString(),
        });
      }
    }

    // 7) Parse output (se schema)
    let data: unknown;
    if (args.schema) {
      try {
        const parsed = JSON.parse(response.text);
        data = args.schema.parse(parsed);
      } catch (err) {
        throw new Error(
          `Resposta IA não pôde ser parseada/validada contra schema. modelo=${modelUsed}, erro=${(err as Error).message}, raw=${response.text.slice(0, 300)}`,
        );
      }
    } else {
      data = response.text;
    }

    const latency_ms = Date.now() - t0;

    // 8) Audit log
    this.audit({
      task: args.task,
      model: modelUsed,
      provider: providerName,
      cost_brl,
      latency_ms,
      cache_hit: response.cache_hit,
      fallback_used: fallbackUsed,
      ...(args.patientId !== undefined ? { patient_id: args.patientId } : {}),
      prompt_hash: shortHash(args.systemPrompt + args.userPrompt),
      response_hash: shortHash(response.text),
      ts: new Date().toISOString(),
    });

    return {
      data: data as TSchema extends z.ZodTypeAny ? z.infer<TSchema> : string,
      model: modelUsed,
      provider: providerName,
      cost_brl,
      latency_ms,
      cache_hit: response.cache_hit,
      fallback_used: fallbackUsed,
    };
  }

  budgetSnapshot(patientId: string) {
    return this.budget.snapshot(patientId);
  }

  private audit(entry: AuditLogEntry): void {
    if (this.onAuditLog) {
      this.onAuditLog(entry);
    } else {
      // Default: console (em produção: append a tabela `audit_event`)
      // eslint-disable-next-line no-console
      console.log(`[ai-router] ${JSON.stringify(entry)}`);
    }
  }
}

/**
 * Conversão simples Zod → JSON Schema.
 * Para POC suporta: object, string, number, boolean, array, enum, optional.
 * Em produção: usar `zod-to-json-schema` ou Zod 4 native `toJSONSchema()`.
 */
function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // Usa o método interno _def — funciona para shapes simples.
  // Quando upgradar pro Zod v4, trocar por `z.toJSONSchema(schema)` nativo.
  const def = (schema as unknown as { _def: { typeName: string } })._def;

  switch (def.typeName) {
    case "ZodObject": {
      const shape = (schema as unknown as { shape: Record<string, z.ZodTypeAny> }).shape;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];
      for (const [key, val] of Object.entries(shape)) {
        properties[key] = zodToJsonSchema(val);
        const innerDef = (val as unknown as { _def: { typeName: string } })._def;
        if (innerDef.typeName !== "ZodOptional") required.push(key);
      }
      return { type: "object", properties, required, additionalProperties: false };
    }
    case "ZodString":
      return { type: "string" };
    case "ZodNumber":
      return { type: "number" };
    case "ZodBoolean":
      return { type: "boolean" };
    case "ZodArray": {
      const inner = (schema as unknown as { element: z.ZodTypeAny }).element;
      return { type: "array", items: zodToJsonSchema(inner) };
    }
    case "ZodEnum": {
      const values = (schema as unknown as { _def: { values: string[] } })._def.values;
      return { type: "string", enum: values };
    }
    case "ZodOptional": {
      const inner = (schema as unknown as { _def: { innerType: z.ZodTypeAny } })._def.innerType;
      return zodToJsonSchema(inner);
    }
    case "ZodNullable": {
      const inner = (schema as unknown as { _def: { innerType: z.ZodTypeAny } })._def.innerType;
      const innerSchema = zodToJsonSchema(inner);
      return { ...innerSchema, nullable: true };
    }
    default:
      return { type: "string" };
  }
}

function shortHash(s: string): string {
  // FNV-1a 32-bit — suficiente para identificar prompts em logs
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

export { ROUTING_TABLE } from "./routing-table.js";
export type {
  TaskName,
  Tier,
  InvokeArgs,
  InvokeResult,
  Provider,
  ProviderName,
} from "./types.js";
export { BudgetExceededError, ProviderUnavailableError } from "./types.js";

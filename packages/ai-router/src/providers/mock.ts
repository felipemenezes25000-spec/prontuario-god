import type { Provider, ProviderInvokeArgs, ProviderResponse } from "../types.js";

/**
 * Provider Mock — usado quando nenhum provider real está configurado.
 * Útil para dev local sem keys, smoke tests, CI.
 *
 * Retorna saída plausível para cada task identificada via systemPrompt.
 */
export class MockProvider implements Provider {
  readonly name = "mock" as const;

  isConfigured(): boolean {
    return true;
  }

  async invoke(args: ProviderInvokeArgs): Promise<ProviderResponse> {
    let text: string;
    if (args.jsonSchema) {
      // Static handoff para a tarefa de titulação (mais detalhado).
      // Para qualquer outra task com schema: gera dado plausível a partir do JSON Schema.
      const titulacaoStub = args.systemPrompt.toLowerCase().includes("titulação")
        ? this.fakeStructured(args)
        : null;
      const data = titulacaoStub ?? generateFromJsonSchema(args.jsonSchema);
      text = JSON.stringify(data, null, 2);
    } else {
      text = this.fakeText(args);
    }

    return {
      text,
      prompt_tokens: estimateTokens(args.systemPrompt + args.userPrompt),
      completion_tokens: estimateTokens(text),
      cache_hit: false,
    };
  }

  private fakeStructured(args: ProviderInvokeArgs): unknown {
    // Heurística: detecta o tipo de tarefa pelo conteúdo do system prompt.
    if (args.systemPrompt.toLowerCase().includes("titulação")) {
      return {
        protocolo_recomendado: "routine",
        protocolo_justificativa:
          "[MOCK] Adulto sem polifarmácia complexa nem comorbidade hepática — Routine padrão.",
        produto_sugerido: {
          tipo: "CBD-predominante",
          via_administracao: "sublingual",
          razao:
            "[MOCK] Sublingual oferece onset 15min e duração 6h, ideal para titulação inicial controlada.",
        },
        dose_inicial: {
          cbd_mg: 5,
          thc_mg: null,
          frequencia_diaria: 2,
          via: "sublingual",
        },
        ramp_up: [
          { dia: 1, cbd_mg_dia: 10, thc_mg_dia: null, observacao: "[MOCK] Início." },
          { dia: 3, cbd_mg_dia: 20, thc_mg_dia: null, observacao: "[MOCK] Se tolerado." },
          {
            dia: 6,
            cbd_mg_dia: 30,
            thc_mg_dia: null,
            observacao: "[MOCK] Checagem clínica.",
          },
          {
            dia: 9,
            cbd_mg_dia: 40,
            thc_mg_dia: null,
            observacao: "[MOCK] Dose alvo Routine.",
          },
        ],
        red_flags_interacoes: [],
        alerta_compliance: {
          receita_tipo: "B",
          via_regulatoria: "anvisa_industrializado",
          observacao_cfm: null,
        },
        evidencia: {
          nivel: "B",
          referencias: ["MacCallum 2021 Delphi consensus (PMC8252988)"],
        },
        proximos_passos: [
          "[MOCK] Agendar retorno em 14 dias",
          "[MOCK] Solicitar TGO/TGP basal",
          "[MOCK] Orientar paciente sobre logging diário no app",
        ],
        disclaimer: "[MOCK] Configure GEMINI_API_KEY para sugestão real.",
      };
    }
    return { ok: true, mock: true };
  }

  private fakeText(_args: ProviderInvokeArgs): string {
    return "[MOCK] Resposta de exemplo. Configure GEMINI_API_KEY ou OPENAI_API_KEY para usar IA real.";
  }
}

function estimateTokens(text: string): number {
  // Aproximação grosseira: ~4 chars/token em PT-BR
  return Math.ceil(text.length / 4);
}

/**
 * Gera dado plausível a partir de um JSON Schema (subset que usamos).
 * Suporta: object, string, number, boolean, array, enum, nullable.
 */
function generateFromJsonSchema(schema: unknown): unknown {
  if (!schema || typeof schema !== "object") return "[MOCK]";
  const s = schema as Record<string, unknown>;
  if (s.nullable === true) return null;

  const type = s.type as string | undefined;
  if (type === "object") {
    const out: Record<string, unknown> = {};
    const props = (s.properties ?? {}) as Record<string, unknown>;
    for (const [key, sub] of Object.entries(props)) {
      out[key] = generateFromJsonSchema(sub);
    }
    return out;
  }
  if (type === "array") {
    return [generateFromJsonSchema(s.items)];
  }
  if (type === "string") {
    if (Array.isArray(s.enum) && s.enum.length > 0) return s.enum[0];
    return "[MOCK_STRING]";
  }
  if (type === "number" || type === "integer") return 0;
  if (type === "boolean") return true;
  return null;
}

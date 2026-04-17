import type { Provider, ProviderInvokeArgs, ProviderResponse } from "../types.js";
import { ProviderUnavailableError } from "../types.js";

/**
 * Provider Gemini — usa REST direto (evita dep extra do @google/genai no MVP).
 * Endpoint generateContent com responseSchema para structured output.
 */
export class GeminiProvider implements Provider {
  readonly name = "gemini" as const;

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel: string = "gemini-2.5-flash-lite",
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  async invoke(args: ProviderInvokeArgs): Promise<ProviderResponse> {
    if (!this.isConfigured()) {
      throw new ProviderUnavailableError("gemini", new Error("GEMINI_API_KEY ausente"));
    }

    const model = args.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const generationConfig: Record<string, unknown> = {
      temperature: 0.2,
      maxOutputTokens: 2048,
    };

    if (args.jsonSchema) {
      generationConfig.responseMimeType = "application/json";
      generationConfig.responseSchema = sanitizeSchemaForGemini(args.jsonSchema);
    }

    const body = {
      systemInstruction: { parts: [{ text: args.systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: args.userPrompt }] }],
      generationConfig,
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new ProviderUnavailableError("gemini", err);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "<no body>");
      throw new ProviderUnavailableError(
        "gemini",
        new Error(`HTTP ${res.status}: ${errText.slice(0, 500)}`),
      );
    }

    const json = (await res.json()) as GeminiResponse;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const usage = json.usageMetadata ?? {
      promptTokenCount: 0,
      candidatesTokenCount: 0,
    };

    return {
      text,
      prompt_tokens: usage.promptTokenCount,
      completion_tokens: usage.candidatesTokenCount,
      // Gemini reporta cachedContentTokenCount quando aplicável
      cache_hit: (usage.cachedContentTokenCount ?? 0) > 0,
    };
  }
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    cachedContentTokenCount?: number;
  };
}

/**
 * Gemini só aceita um subset do JSON Schema. Strip campos não-suportados:
 * - additionalProperties
 * - $schema
 * - definitions
 * - const
 */
function sanitizeSchemaForGemini(schema: Record<string, unknown>): Record<string, unknown> {
  const UNSUPPORTED = new Set([
    "additionalProperties",
    "$schema",
    "definitions",
    "$defs",
    "const",
    "$ref",
  ]);
  function walk(node: unknown): unknown {
    if (Array.isArray(node)) return node.map(walk);
    if (node && typeof node === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (UNSUPPORTED.has(k)) continue;
        out[k] = walk(v);
      }
      return out;
    }
    return node;
  }
  return walk(schema) as Record<string, unknown>;
}

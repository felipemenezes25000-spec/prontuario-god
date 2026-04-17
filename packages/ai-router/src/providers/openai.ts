import type { Provider, ProviderInvokeArgs, ProviderResponse } from "../types.js";
import { ProviderUnavailableError } from "../types.js";

/**
 * Provider OpenAI — fetch direto na API Chat Completions.
 * Suporta json_schema para structured output (gpt-4o-mini, gpt-4o).
 */
export class OpenAIProvider implements Provider {
  readonly name = "openai" as const;

  constructor(
    private readonly apiKey: string,
    private readonly defaultModel: string = "gpt-4o-mini",
  ) {}

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  async invoke(args: ProviderInvokeArgs): Promise<ProviderResponse> {
    if (!this.isConfigured()) {
      throw new ProviderUnavailableError("openai", new Error("OPENAI_API_KEY ausente"));
    }

    const model = args.model || this.defaultModel;
    const body: Record<string, unknown> = {
      model,
      temperature: 0.2,
      max_tokens: 2048,
      messages: [
        { role: "system", content: args.systemPrompt },
        { role: "user", content: args.userPrompt },
      ],
    };

    if (args.jsonSchema) {
      body.response_format = {
        type: "json_schema",
        json_schema: {
          name: "structured_response",
          strict: true,
          schema: args.jsonSchema,
        },
      };
    }

    let res: Response;
    try {
      res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new ProviderUnavailableError("openai", err);
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "<no body>");
      throw new ProviderUnavailableError(
        "openai",
        new Error(`HTTP ${res.status}: ${errText.slice(0, 500)}`),
      );
    }

    const json = (await res.json()) as OpenAIResponse;
    const text = json.choices?.[0]?.message?.content ?? "";
    const usage = json.usage ?? { prompt_tokens: 0, completion_tokens: 0 };
    const cachedTokens = json.usage?.prompt_tokens_details?.cached_tokens ?? 0;

    return {
      text,
      prompt_tokens: usage.prompt_tokens,
      completion_tokens: usage.completion_tokens,
      cache_hit: cachedTokens > 0,
    };
  }
}

interface OpenAIResponse {
  choices?: Array<{ message?: { content?: string } }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    prompt_tokens_details?: { cached_tokens?: number };
  };
}

/**
 * Segunda passada — Llama 3.1 8B local via Ollama para nomes próprios e contexto sensível
 * que regex não captura. NUNCA chama API externa (privacidade absoluta).
 *
 * Se Ollama não estiver disponível, faz no-op com warning. Em produção, deve ser bloqueante.
 */

export interface LlmRedactArgs {
  text: string;
  baseUrl: string; // http://localhost:11434
  model: string; // llama3.1:8b
  /** Categorias adicionais a procurar */
  extraCategories?: string[];
}

export interface LlmRedactResult {
  spans: Array<{ start: number; end: number; category: string; original: string }>;
}

const PROMPT_TEMPLATE = `Você é um redator de PII para sistemas médicos brasileiros operando sob LGPD.

Sua tarefa: identificar TODAS as ocorrências de:
- Nomes próprios de pessoas (pacientes, médicos, familiares)
- Nomes de instituições de saúde específicas (hospitais, clínicas)
- Endereços completos (rua, bairro)
- Números de prontuário, números de processo

NÃO marque: condições médicas (CID), medicamentos, doses, sintomas — esses são informação clínica útil.

Retorne JSON com array de spans:
{ "spans": [ { "start": 12, "end": 24, "category": "NOME", "original": "João Silva" } ] }

Os índices são posições de char no texto. Se não houver PII, retorne { "spans": [] }.

TEXTO:
"""
{TEXT}
"""`;

export async function llmRedact(args: LlmRedactArgs): Promise<LlmRedactResult> {
  const prompt = PROMPT_TEMPLATE.replace("{TEXT}", args.text);

  const body = {
    model: args.model,
    prompt,
    stream: false,
    format: "json",
    options: { temperature: 0 },
  };

  let res: Response;
  try {
    res = await fetch(`${args.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    // Ollama down — no MVP, retorna vazio com aviso. Em produção: BLOQUEAR.
    console.warn(
      `[pii-redactor] Ollama indisponível em ${args.baseUrl}. Pulando redação semântica. ` +
        `MVP-only — em produção isto deve ser ERRO. Causa: ${(err as Error).message}`,
    );
    return { spans: [] };
  }

  if (!res.ok) {
    console.warn(`[pii-redactor] Ollama HTTP ${res.status}. Pulando redação semântica.`);
    return { spans: [] };
  }

  const json = (await res.json()) as { response?: string };
  if (!json.response) return { spans: [] };

  try {
    const parsed = JSON.parse(json.response) as LlmRedactResult;
    return { spans: parsed.spans ?? [] };
  } catch {
    return { spans: [] };
  }
}

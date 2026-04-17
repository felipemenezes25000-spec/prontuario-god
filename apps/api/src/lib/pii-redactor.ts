import { PiiRedactor } from "@meridiana/pii-redactor";
import { env } from "../env.js";

/**
 * Singleton do PII redactor. 2ª passada (Llama via Ollama) habilitada por padrão.
 * Se Ollama não responder, faz no-op com aviso (POC).
 * Em produção: bloquear chamada externa se Ollama down.
 */
export const piiRedactor = new PiiRedactor({
  ollama: {
    baseUrl: env.OLLAMA_BASE_URL,
    model: env.OLLAMA_MODEL_PII,
  },
  useLlmPass: true,
});

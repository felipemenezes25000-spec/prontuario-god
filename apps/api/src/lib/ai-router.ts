import { AIRouter } from "@meridiana/ai-router";
import { env } from "../env.js";

/** Singleton — uma instância para todo o processo. */
export const aiRouter = new AIRouter({
  geminiApiKey: env.GEMINI_API_KEY,
  openaiApiKey: env.OPENAI_API_KEY,
  softLimitBrlPerPatientMonth: env.AI_BUDGET_BRL_PER_PATIENT_MONTH,
  hardStopBrlPerPatientMonth: env.AI_BUDGET_HARD_STOP_BRL_PER_PATIENT_MONTH,
  onAuditLog: (entry) => {
    // POC: apenas console. Produção: append em tabela `audit_event`.
    console.log(JSON.stringify({ kind: "audit.ai", ...entry }));
  },
});

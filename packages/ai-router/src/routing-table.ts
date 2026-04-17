import type { RouteSpec, TaskName } from "./types.js";

/**
 * Tabela de roteamento. Cheap-first.
 * Custos referenciam pricing público dos provedores (out-2025), convertido a R$ 5,00/USD.
 * Atualizar quando provedores mudarem pricing.
 */
export const ROUTING_TABLE: Record<TaskName, RouteSpec> = {
  "titulacao.recommend": {
    primary: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    fallback: { provider: "openai", model: "gpt-4o-mini" },
    premium: { provider: "openai", model: "gpt-4o" },
    cost_per_1k_input_brl: 0.0005,
    cost_per_1k_output_brl: 0.002,
    supports_cache: true,
  },
  "titulacao.explain_to_patient": {
    primary: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    fallback: { provider: "openai", model: "gpt-4o-mini" },
    cost_per_1k_input_brl: 0.0005,
    cost_per_1k_output_brl: 0.002,
    supports_cache: true,
  },
  "soap.structure": {
    primary: { provider: "openai", model: "gpt-4o-mini" },
    fallback: { provider: "gemini", model: "gemini-2.5-flash" },
    cost_per_1k_input_brl: 0.00075,
    cost_per_1k_output_brl: 0.003,
    supports_cache: true,
  },
  "tracker.insights_weekly": {
    primary: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    fallback: { provider: "openai", model: "gpt-4o-mini" },
    cost_per_1k_input_brl: 0.0005,
    cost_per_1k_output_brl: 0.002,
    supports_cache: true,
  },
  "consulta.brief": {
    primary: { provider: "openai", model: "gpt-4o-mini" },
    fallback: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    cost_per_1k_input_brl: 0.00075,
    cost_per_1k_output_brl: 0.003,
    supports_cache: true,
  },
  "logistics.ocr": {
    primary: { provider: "gemini", model: "gemini-2.5-flash" },
    fallback: { provider: "openai", model: "gpt-4o-mini" },
    cost_per_1k_input_brl: 0.0008,
    cost_per_1k_output_brl: 0.004,
    supports_cache: false,
  },
  "marketplace.bula_to_lay": {
    primary: { provider: "openai", model: "gpt-4o-mini" },
    fallback: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    cost_per_1k_input_brl: 0.00075,
    cost_per_1k_output_brl: 0.003,
    supports_cache: true,
  },
  "cohort.narrative_insight": {
    primary: { provider: "gemini", model: "gemini-2.5-flash" },
    fallback: { provider: "openai", model: "gpt-4o-mini" },
    cost_per_1k_input_brl: 0.0008,
    cost_per_1k_output_brl: 0.004,
    supports_cache: true,
  },
  "sms.parse": {
    primary: { provider: "openai", model: "gpt-4o-mini" },
    fallback: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    cost_per_1k_input_brl: 0.00075,
    cost_per_1k_output_brl: 0.003,
    supports_cache: true,
  },
  "regulacao.diff": {
    primary: { provider: "openai", model: "gpt-4o-mini" },
    fallback: { provider: "gemini", model: "gemini-2.5-flash-lite" },
    cost_per_1k_input_brl: 0.00075,
    cost_per_1k_output_brl: 0.003,
    supports_cache: true,
  },
  "petition.draft": {
    primary: { provider: "openai", model: "gpt-4o" },
    fallback: { provider: "openai", model: "gpt-4o-mini" },
    cost_per_1k_input_brl: 0.0125,
    cost_per_1k_output_brl: 0.05,
    supports_cache: true,
  },
};

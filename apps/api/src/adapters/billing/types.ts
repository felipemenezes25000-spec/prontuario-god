/**
 * Billing — planos e assinaturas.
 *
 * Planos Meridiana:
 * - free: 1 médico, 20 pacientes, 0 telemed; reverte a paid após 1000 médicos wedge
 * - solo: R$ 149/mês — 1 médico, 200 pacientes, 50h telemed
 * - clinica: R$ 499/mês — 5 médicos, 1000 pacientes, 200h telemed
 * - enterprise: R$ 1999+/mês — custom, SSO, auditoria dedicada
 *
 * Gateway: Stripe (internacional) ou Pagar.me (PIX + cartão BR).
 * Para BR, Pagar.me é melhor UX de PIX recorrente. Stripe tem PIX agora mas é limitado.
 *
 * Processo:
 * 1. Clinic cria Subscription no gateway → webhook confirma
 * 2. Webhook `invoice.paid` → atualiza Invoice.paid_at
 * 3. Webhook `invoice.payment_failed` → status=past_due → notifica admin clinica
 * 4. 3 falhas → cancel automático (retention pipeline grátis por 30d)
 */

export type PlanId = "free" | "solo" | "clinica" | "enterprise";

export interface PlanSpec {
  id: PlanId;
  nome: string;
  preco_brl: number;
  max_medicos: number;
  max_pacientes_ativos: number;
  max_telemed_horas_mes: number;
  max_prescricoes_mes: number;
  recursos: string[];
}

export const PLANOS: Record<PlanId, PlanSpec> = {
  free: {
    id: "free",
    nome: "Wedge 12 meses",
    preco_brl: 0,
    max_medicos: 1,
    max_pacientes_ativos: 20,
    max_telemed_horas_mes: 0,
    max_prescricoes_mes: 50,
    recursos: ["M1 Co-Pilot Titulação", "M3 Receita ANVISA (Tipo A/B)", "Audit log LGPD"],
  },
  solo: {
    id: "solo",
    nome: "Solo",
    preco_brl: 149,
    max_medicos: 1,
    max_pacientes_ativos: 200,
    max_telemed_horas_mes: 50,
    max_prescricoes_mes: 500,
    recursos: ["Todos os módulos M1-M5", "Assinatura ICP-Brasil (1 cert)", "WhatsApp templates", "RDC 660 tracking"],
  },
  clinica: {
    id: "clinica",
    nome: "Clínica",
    preco_brl: 499,
    max_medicos: 5,
    max_pacientes_ativos: 1000,
    max_telemed_horas_mes: 200,
    max_prescricoes_mes: 3000,
    recursos: ["Multi-médico com RBAC", "Relatórios epidemiológicos", "5 certificados ICP", "API de integração"],
  },
  enterprise: {
    id: "enterprise",
    nome: "Enterprise",
    preco_brl: 1999,
    max_medicos: Number.POSITIVE_INFINITY,
    max_pacientes_ativos: Number.POSITIVE_INFINITY,
    max_telemed_horas_mes: Number.POSITIVE_INFINITY,
    max_prescricoes_mes: Number.POSITIVE_INFINITY,
    recursos: ["SSO SAML", "DPO dedicado", "SLA 99.9%", "Cohort & Evidence Lab (M8)", "Whisper dedicado"],
  },
};

export interface CriarAssinaturaInput {
  clinic_id: string;
  plan: PlanId;
  cartao_token?: string;       // Stripe PaymentMethod ou Pagar.me card_id
  pix_pagador_cpf?: string;
  trial_dias?: number;
}

export interface ResultadoAssinatura {
  provider_sub_id: string;
  provider_customer_id: string;
  status: "trial" | "active" | "past_due" | "canceled";
  current_period_end: string;
  checkout_url?: string;
}

export interface BillingAdapter {
  criarAssinatura(input: CriarAssinaturaInput): Promise<ResultadoAssinatura>;
  cancelarAssinatura(provider_sub_id: string, ao_final_periodo: boolean): Promise<void>;
  portalCliente(provider_customer_id: string): Promise<{ url: string }>;
  verificarWebhook(payload: string, signature: string): { event_type: string; data: unknown } | null;
}

import { randomUUID } from "node:crypto";
import type { BillingAdapter, CriarAssinaturaInput, ResultadoAssinatura } from "./types.js";

export const billingMockAdapter: BillingAdapter = {
  async criarAssinatura(input: CriarAssinaturaInput): Promise<ResultadoAssinatura> {
    const trialDias = input.trial_dias ?? 14;
    const current_period_end = new Date(Date.now() + trialDias * 86400_000).toISOString();
    return {
      provider_sub_id: `sub_mock_${randomUUID().slice(0, 10)}`,
      provider_customer_id: `cus_mock_${randomUUID().slice(0, 10)}`,
      status: trialDias > 0 ? "trial" : "active",
      current_period_end,
      checkout_url: `https://mock.meridiana.pay/checkout/${randomUUID()}`,
    };
  },
  async cancelarAssinatura(_id, _ao_final) {
    /* no-op */
  },
  async portalCliente(provider_customer_id) {
    return { url: `https://mock.meridiana.pay/portal/${provider_customer_id}` };
  },
  verificarWebhook(_payload, _signature) {
    return { event_type: "mock.event", data: {} };
  },
};

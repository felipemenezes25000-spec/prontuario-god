/**
 * Stripe adapter — requer `npm i stripe` + STRIPE_SECRET_KEY.
 *
 * Evitamos a dep direto aqui para manter o bundle leve; quando for ativar,
 * instale: `pnpm --filter @meridiana/api add stripe`.
 *
 * Implementação usa fetch puro contra a API Stripe (para evitar dep ESM/CJS issues).
 * Em produção, migre para o SDK oficial para ter types nos webhooks.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { BillingAdapter, CriarAssinaturaInput, ResultadoAssinatura } from "./types.js";
import { env } from "../../env.js";

const API = "https://api.stripe.com/v1";

const PRICE_IDS: Record<string, string | undefined> = {
  free: undefined,
  solo: "price_meridiana_solo_monthly",       // substitua pelos IDs reais do seu dashboard
  clinica: "price_meridiana_clinica_monthly",
  enterprise: "price_meridiana_enterprise_monthly",
};

function requireKey(): string {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não configurado. Use BILLING_ADAPTER=mock em dev.");
  }
  return env.STRIPE_SECRET_KEY;
}

async function stripePost<T>(path: string, body: Record<string, string>): Promise<T> {
  const key = requireKey();
  const form = new URLSearchParams(body).toString();
  const resp = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Stripe ${path} failed: ${resp.status} ${err}`);
  }
  return resp.json() as Promise<T>;
}

export const billingStripeAdapter: BillingAdapter = {
  async criarAssinatura(input: CriarAssinaturaInput): Promise<ResultadoAssinatura> {
    if (input.plan === "free") {
      throw new Error("Plano free não usa Stripe");
    }
    const priceId = PRICE_IDS[input.plan];
    if (!priceId) throw new Error(`price_id não mapeado para plano ${input.plan}`);

    const customer = await stripePost<{ id: string }>("/customers", {
      [`metadata[clinic_id]`]: input.clinic_id,
    });

    const sub = await stripePost<{
      id: string;
      status: string;
      current_period_end: number;
      latest_invoice: string;
    }>("/subscriptions", {
      customer: customer.id,
      [`items[0][price]`]: priceId,
      ...(input.trial_dias ? { trial_period_days: String(input.trial_dias) } : {}),
      [`metadata[clinic_id]`]: input.clinic_id,
    });

    return {
      provider_sub_id: sub.id,
      provider_customer_id: customer.id,
      status:
        sub.status === "trialing"
          ? "trial"
          : sub.status === "active"
          ? "active"
          : sub.status === "past_due"
          ? "past_due"
          : "canceled",
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    };
  },

  async cancelarAssinatura(provider_sub_id, ao_final_periodo) {
    await stripePost(`/subscriptions/${provider_sub_id}`, {
      cancel_at_period_end: ao_final_periodo ? "true" : "false",
    });
  },

  async portalCliente(provider_customer_id) {
    const sess = await stripePost<{ url: string }>("/billing_portal/sessions", {
      customer: provider_customer_id,
      return_url: "https://meridiana.health/clinica/configuracoes/billing",
    });
    return { url: sess.url };
  },

  verificarWebhook(payload: string, signature: string) {
    if (!env.STRIPE_WEBHOOK_SECRET) return null;

    // Stripe-Signature: t=<timestamp>,v1=<sig>,v1=<sig>,...
    const parts = signature.split(",").reduce<Record<string, string>>((acc, p) => {
      const [k, v] = p.split("=");
      if (k && v) acc[k] = v;
      return acc;
    }, {});
    if (!parts.t || !parts.v1) return null;

    const signed = `${parts.t}.${payload}`;
    const expected = createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(signed).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(parts.v1);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    const parsed = JSON.parse(payload) as { type: string; data: unknown };
    return { event_type: parsed.type, data: parsed.data };
  },
};

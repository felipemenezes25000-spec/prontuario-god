import { env } from "../../env.js";
import type { BillingAdapter } from "./types.js";
import { billingMockAdapter } from "./mock.js";
import { billingStripeAdapter } from "./stripe.js";

export function getBillingAdapter(): BillingAdapter {
  switch (env.BILLING_ADAPTER) {
    case "stripe":
      return billingStripeAdapter;
    case "pagarme":
      throw new Error("Pagar.me adapter ainda não implementado. Use 'mock' ou 'stripe'.");
    case "mock":
    default:
      return billingMockAdapter;
  }
}

export type * from "./types.js";
export { PLANOS } from "./types.js";

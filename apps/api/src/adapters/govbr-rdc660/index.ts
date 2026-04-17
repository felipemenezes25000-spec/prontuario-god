import { env } from "../../env.js";
import type { GovbrRdc660Adapter } from "./types.js";
import { govbrMockAdapter } from "./mock.js";

export function getGovbrRdc660Adapter(): GovbrRdc660Adapter {
  switch (env.GOVBR_RDC660_ADAPTER) {
    case "gov_sei_real":
      throw new Error(
        "gov_sei_real ainda não implementado — ANVISA não expõe API; integração é semiautomática (ofício + tracking pull)",
      );
    case "mock":
    default:
      return govbrMockAdapter;
  }
}

export type * from "./types.js";

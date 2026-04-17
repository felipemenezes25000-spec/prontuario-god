import { env } from "../../env.js";
import type { CfmAdapter } from "./types.js";
import { cfmMockAdapter } from "./mock.js";
import { cfmPortalScraperAdapter } from "./portal-scraper.js";

export function getCfmAdapter(): CfmAdapter {
  switch (env.CFM_ADAPTER) {
    case "cfm_portal_scraper":
      return cfmPortalScraperAdapter;
    case "mock":
    default:
      return cfmMockAdapter;
  }
}

export type { CfmAdapter, CrmStatus } from "./types.js";

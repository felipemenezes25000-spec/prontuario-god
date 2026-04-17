import { env } from "../../env.js";
import type { IcpBrasilAdapter } from "./types.js";
import { icpBrasilMockAdapter } from "./mock.js";
import { icpBrasilVidaasAdapter } from "./vidaas.js";

export function getIcpBrasilAdapter(): IcpBrasilAdapter {
  switch (env.ICP_BRASIL_ADAPTER) {
    case "vidaas":
      return icpBrasilVidaasAdapter;
    case "soluti":
    case "birdid":
      throw new Error(`ICP_BRASIL_ADAPTER=${env.ICP_BRASIL_ADAPTER} ainda não implementado. Use 'mock' ou 'vidaas'.`);
    case "mock":
    default:
      return icpBrasilMockAdapter;
  }
}

export type * from "./types.js";

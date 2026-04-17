import { env } from "../../env.js";
import type { WhatsappAdapter } from "./types.js";
import { whatsappMockAdapter } from "./mock.js";
import { whatsappMetaCloudAdapter } from "./meta-cloud.js";

export function getWhatsappAdapter(): WhatsappAdapter {
  switch (env.WHATSAPP_ADAPTER) {
    case "meta_cloud":
      return whatsappMetaCloudAdapter;
    case "mock":
    default:
      return whatsappMockAdapter;
  }
}

export type * from "./types.js";

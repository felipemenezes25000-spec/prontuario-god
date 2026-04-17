import { env } from "../../env.js";
import type { LivekitAdapter } from "./types.js";
import { livekitMockAdapter } from "./mock.js";
import { livekitCloudAdapter } from "./livekit-cloud.js";

export function getLivekitAdapter(): LivekitAdapter {
  switch (env.LIVEKIT_ADAPTER) {
    case "livekit_cloud":
      return livekitCloudAdapter;
    case "mock":
    default:
      return livekitMockAdapter;
  }
}

export type * from "./types.js";

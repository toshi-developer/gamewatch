import { getConfig, getServerConfig } from "./config";
import type { GameProvider } from "./providers/types";
import type { ServerConfig } from "./config.schema";
import { SdtdProvider } from "./providers/sdtd";
import { FiveMProvider } from "./providers/fivem";
import { StubProvider } from "./providers/stub";

const providers = new Map<string, GameProvider>();

function createProvider(config: ServerConfig): GameProvider {
  switch (config.game) {
    case "sdtd":
      return new SdtdProvider(config);
    case "fivem":
      return new FiveMProvider(config);
    default:
      return new StubProvider(config);
  }
}

export function getProvider(serverId: string): GameProvider {
  if (providers.has(serverId)) return providers.get(serverId)!;

  const config = getServerConfig(serverId);
  if (!config) throw new Error(`Unknown server: ${serverId}`);

  const provider = createProvider(config);
  providers.set(serverId, provider);
  return provider;
}

export function getAllServers() {
  return getConfig().servers;
}

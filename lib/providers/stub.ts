import type { ServerConfig } from "@/lib/config.schema";
import type {
  GameProvider,
  ProviderCapabilities,
  ServerStatus,
  Player,
} from "./types";

/**
 * Stub provider for games not yet implemented.
 * Returns basic "coming soon" responses so the app doesn't crash.
 */
export class StubProvider implements GameProvider {
  readonly displayName: string;
  readonly capabilities: ProviderCapabilities = {
    hasMap: false,
    hasPlayerPositions: false,
    hasBlips: false,
    hasRankings: false,
    hasModList: false,
    hasServerSettings: false,
    hasGameEvents: false,
  };

  constructor(private config: ServerConfig) {
    const names: Record<string, string> = {
      minecraft: "Minecraft",
      palworld: "Palworld",
      rust: "Rust",
      ark: "ARK: Survival Ascended",
    };
    this.displayName = names[config.game] ?? config.game;
  }

  get id() {
    return this.config.game;
  }

  async getStatus(): Promise<ServerStatus> {
    // Try a basic HTTP check
    try {
      const res = await fetch(this.config.apiUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      return {
        online: res.ok,
        playerCount: 0,
        maxPlayers: 0,
        version: "",
        serverName: this.config.label,
        gameSpecific: {},
      };
    } catch {
      return {
        online: false,
        playerCount: 0,
        maxPlayers: 0,
        version: "",
        serverName: this.config.label,
        gameSpecific: {},
      };
    }
  }

  async getPlayers(): Promise<Player[]> {
    return [];
  }
}

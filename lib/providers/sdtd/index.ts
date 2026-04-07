import type { ServerConfig } from "@/lib/config.schema";
import type {
  GameProvider,
  ProviderCapabilities,
  ServerStatus,
  Player,
  ModEntry,
  MapConfig,
  GameEvent,
  ServerSetting,
} from "../types";
import {
  getStats,
  getServerInfo,
  getPlayersOnline,
  getPlayerList,
  daysUntilBloodMoon,
  formatPlaytime,
  type ServerStats,
  type ServerInfo,
  type OnlinePlayer,
} from "./api";

const DIFFICULTY_LABELS: Record<number, string> = {
  0: "Scavenger",
  1: "Adventurer",
  2: "Warrior",
  3: "Survivalist",
  4: "Insane",
};

export class SdtdProvider implements GameProvider {
  readonly id = "sdtd";
  readonly displayName = "7 Days to Die";
  readonly capabilities: ProviderCapabilities = {
    hasMap: true,
    hasPlayerPositions: true,
    hasBlips: false,
    hasRankings: true,
    hasModList: true,
    hasServerSettings: true,
    hasGameEvents: true,
  };

  constructor(private config: ServerConfig) {}

  private get apiUrl() {
    return this.config.apiUrl;
  }

  private get headers(): HeadersInit {
    const h: HeadersInit = { Accept: "application/json" };
    if (this.config.auth?.tokenName && this.config.auth?.tokenSecret) {
      h["X-SDTD-API-TOKENNAME"] = this.config.auth.tokenName;
      h["X-SDTD-API-SECRET"] = this.config.auth.tokenSecret;
    }
    return h;
  }

  private async fetchApi<T>(path: string): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, {
      headers: this.headers,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`7DTD API error: ${res.status} (${path})`);
    return res.json() as Promise<T>;
  }

  async getStatus(): Promise<ServerStatus> {
    const [stats, info] = await Promise.all([
      this.fetchApi<ServerStats>("/api/getstats"),
      this.fetchApi<ServerInfo>("/api/getserverinfo"),
    ]);

    const freq = Number(info.BloodMoonFrequency?.value ?? 7);
    return {
      online: true,
      playerCount: stats.players,
      maxPlayers: Number(info.MaxPlayers?.value ?? 0),
      version: String(info.Version?.value ?? ""),
      serverName: String(info.GameName?.value ?? this.config.label),
      mapName: String(info.LevelName?.value ?? ""),
      gameSpecific: {
        gametime: stats.gametime,
        hostiles: stats.hostiles,
        animals: stats.animals,
        bloodMoonIn: daysUntilBloodMoon(stats.gametime.days, freq),
        bloodMoonFrequency: freq,
        serverInfo: info,
      },
    };
  }

  async getPlayers(): Promise<Player[]> {
    const [online, list] = await Promise.all([
      this.fetchApi<OnlinePlayer[]>("/api/getplayersonline"),
      this.fetchApi<{ players: Array<{ steamid: string; name: string; online: boolean; totalplaytime: number; lastonline: string; banned: boolean }> }>("/api/getplayerlist?rowsperpage=100&page=0").catch(() => ({ players: [] })),
    ]);

    const onlineIds = new Set(online.map((p) => p.steamid));
    const players: Player[] = [
      ...online.map((p) => ({
        id: p.steamid,
        name: p.name,
        online: true,
        ping: p.ping,
        playtime: p.totalplaytime,
        lastSeen: p.lastonline,
        position: p.position,
        gameSpecific: {
          level: p.level,
          health: p.health,
          zombiekills: p.zombiekills,
          playerdeaths: p.playerdeaths,
          score: p.score,
        },
      })),
      ...list.players
        .filter((p) => !onlineIds.has(p.steamid) && !p.banned)
        .map((p) => ({
          id: p.steamid,
          name: p.name,
          online: false,
          playtime: p.totalplaytime,
          lastSeen: p.lastonline,
          gameSpecific: {},
        })),
    ];
    return players;
  }

  async getMods(): Promise<ModEntry[]> {
    if (this.config.mods && this.config.mods.length > 0) {
      return this.config.mods;
    }
    // Fallback: try loading from data/mods.json
    try {
      const modsData = await import("@/data/mods.json");
      return modsData.mods ?? [];
    } catch {
      return [];
    }
  }

  getMapConfig(): MapConfig {
    return {
      tileUrl: `/api/servers/${this.config.id}/map/{z}/{x}/{y}`,
      tileOptions: {
        tileSize: 128,
        minZoom: 0,
        maxZoom: 5,
        maxNativeZoom: 4,
        minNativeZoom: 0,
        flipY: true,
      },
      crs: { type: "sdtd", maxZoom: 4 },
      defaultCenter: [0, 0],
      defaultZoom: 0,
    };
  }

  async getPlayerPositions(): Promise<Player[]> {
    const online = await this.fetchApi<OnlinePlayer[]>(
      "/api/getplayerslocation",
    ).catch(() => [] as OnlinePlayer[]);
    return online
      .filter((p) => p.online)
      .map((p) => ({
        id: p.steamid,
        name: p.name,
        online: true,
        position: p.position,
        gameSpecific: {},
      }));
  }

  async getServerSettings(): Promise<Record<string, ServerSetting>> {
    const info = await this.fetchApi<ServerInfo>("/api/getserverinfo");
    const difficulty = Number(info.GameDifficulty?.value ?? 0);
    return {
      difficulty: { label: "Difficulty", value: DIFFICULTY_LABELS[difficulty] ?? `Lv${difficulty}` },
      lootAbundance: { label: "Loot Abundance", value: `${info.LootAbundance?.value ?? 100}%` },
      lootRespawn: { label: "Loot Respawn", value: `${info.LootRespawnDays?.value ?? 7}d` },
      bloodMoon: { label: "Blood Moon", value: `Every ${info.BloodMoonFrequency?.value ?? 7}d` },
      dayNight: { label: "Day/Night Cycle", value: `${info.DayNightLength?.value ?? 60}min/day` },
      airDrop: {
        label: "Air Drop",
        value: Number(info.AirDropFrequency?.value) === 0
          ? "Disabled"
          : `Every ${info.AirDropFrequency?.value}h`,
      },
    };
  }

  async getGameEvents(): Promise<GameEvent[]> {
    const [stats, info] = await Promise.all([
      this.fetchApi<ServerStats>("/api/getstats"),
      this.fetchApi<ServerInfo>("/api/getserverinfo"),
    ]);

    const freq = Number(info.BloodMoonFrequency?.value ?? 7);
    const bm = daysUntilBloodMoon(stats.gametime.days, freq);
    const isNight = stats.gametime.hours >= 22 || stats.gametime.hours < 4;

    return [
      {
        type: "bloodmoon",
        label: "Blood Moon",
        value: bm === 0 ? "TONIGHT" : `${bm}d`,
        color: bm <= 1 ? "red" : bm <= 2 ? "yellow" : undefined,
      },
      {
        type: "daynight",
        label: isNight ? "Night" : "Day",
        value: `${String(stats.gametime.hours).padStart(2, "0")}:${String(stats.gametime.minutes).padStart(2, "0")}`,
        color: isNight ? "yellow" : undefined,
      },
    ];
  }

  async proxyRequest(path: string): Promise<Response> {
    // Allocs requires .png extension for map tiles
    const res = await fetch(`${this.apiUrl}/map/${path}.png`, {
      headers: this.headers,
    });
    return res;
  }
}

export { formatPlaytime } from "./api";

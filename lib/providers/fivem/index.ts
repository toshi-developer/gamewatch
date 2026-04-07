import type { ServerConfig } from "@/lib/config.schema";
import type {
  GameProvider,
  ProviderCapabilities,
  ServerStatus,
  Player,
  ModEntry,
  MapConfig,
  MapBlip,
} from "../types";

// Raw FiveM API types
interface FiveMInfo {
  resources: string[];
  server?: string;
  vars?: Record<string, string>;
  [key: string]: unknown;
}

interface FiveMDynamic {
  clients: number;
  gametype: string;
  hostname: string;
  mapname: string;
  sv_maxclients: string;
}

interface FiveMPlayerRaw {
  endpoint: string;
  id: number;
  identifiers: string[];
  name: string;
  ping: number;
}

interface FiveMPlayerPos {
  id: number;
  name: string;
  ping: number;
  x: number;
  y: number;
  z: number;
}

interface FiveMBlipRaw {
  sprite: number;
  x: number;
  y: number;
  z: number;
  color: number;
  alpha: number;
  display: number;
}

// Resources hidden from public list
const HIDDEN_RESOURCES = new Set([
  "hardcap", "monitor", "baseevents", "mapmanager",
  "sessionmanager", "chat", "spawnmanager", "basic-gamemode",
  "fivem", "webpack", "yarn",
]);

const BLIP_CATEGORIES: Record<string, { sprites: number[]; color: string; label: string }> = {
  police:   { sprites: [60, 137, 526, 574], color: "#3b82f6", label: "Police" },
  hospital: { sprites: [61, 153],           color: "#ef4444", label: "Hospital" },
  fire:     { sprites: [436],               color: "#f97316", label: "Fire" },
  shop:     { sprites: [52, 59, 93, 110, 277, 628], color: "#22c55e", label: "Shop" },
  gas:      { sprites: [361],               color: "#eab308", label: "Gas" },
  garage:   { sprites: [357, 524, 525, 544, 545], color: "#a855f7", label: "Garage" },
  barber:   { sprites: [71],                color: "#ec4899", label: "Barber" },
  clothes:  { sprites: [73],                color: "#ec4899", label: "Clothes" },
  tattoo:   { sprites: [75],                color: "#ec4899", label: "Tattoo" },
  atm:      { sprites: [108, 207],          color: "#06b6d4", label: "ATM" },
  food:     { sprites: [106, 621],          color: "#f59e0b", label: "Food" },
  car:      { sprites: [225, 523, 530],     color: "#8b5cf6", label: "Car Dealer" },
  house:    { sprites: [40, 374, 375, 376], color: "#10b981", label: "House" },
};

function getBlipStyle(sprite: number): { color: string; label: string; radius: number } {
  for (const cat of Object.values(BLIP_CATEGORIES)) {
    if (cat.sprites.includes(sprite)) return { color: cat.color, label: cat.label, radius: 4 };
  }
  return { color: "#6b7280", label: `Blip ${sprite}`, radius: 3 };
}

const TILE_BASE_URL =
  "https://raw.githubusercontent.com/fivenet-app/livemap-tiles/main/tiles/satelite";

export class FiveMProvider implements GameProvider {
  readonly id = "fivem";
  readonly displayName = "FiveM";
  readonly capabilities: ProviderCapabilities = {
    hasMap: true,
    hasPlayerPositions: true,
    hasBlips: true,
    hasRankings: false,
    hasModList: true,
    hasServerSettings: true,
    hasGameEvents: false,
  };

  private resourceName: string;

  constructor(private config: ServerConfig) {
    this.resourceName = config.resourceName ?? "gamewatch_api";
  }

  private get apiUrl() {
    return this.config.apiUrl;
  }

  private async fetchApi<T>(path: string): Promise<T> {
    const res = await fetch(`${this.apiUrl}${path}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`FiveM API error: ${res.status} (${path})`);
    return res.json() as Promise<T>;
  }

  async getStatus(): Promise<ServerStatus> {
    const [info, dyn] = await Promise.all([
      this.fetchApi<FiveMInfo>("/info.json"),
      this.fetchApi<FiveMDynamic>("/dynamic.json"),
    ]);

    const framework = info.resources.includes("qbx_core")
      ? "QBox"
      : info.resources.includes("qb-core")
        ? "QBCore"
        : info.resources.includes("es_extended")
          ? "ESX"
          : "Unknown";

    return {
      online: true,
      playerCount: dyn.clients,
      maxPlayers: Number(dyn.sv_maxclients) || 0,
      version: String(info.server ?? ""),
      serverName: dyn.hostname || this.config.label,
      mapName: dyn.mapname || undefined,
      gameSpecific: {
        framework,
        resourceCount: info.resources.length,
        gametype: dyn.gametype,
        resources: info.resources,
      },
    };
  }

  async getPlayers(): Promise<Player[]> {
    const players = await this.fetchApi<FiveMPlayerRaw[]>("/players.json");
    return players.map((p) => ({
      id: String(p.id),
      name: p.name,
      online: true,
      ping: p.ping,
      gameSpecific: {},
    }));
  }

  async getMods(): Promise<ModEntry[]> {
    if (this.config.mods) return this.config.mods;
    const info = await this.fetchApi<FiveMInfo>("/info.json");
    return info.resources
      .filter((r) => !HIDDEN_RESOURCES.has(r))
      .sort()
      .map((r) => ({ name: r }));
  }

  getMapConfig(): MapConfig {
    return {
      tileUrl: `/api/servers/${this.config.id}/map/{z}/{x}/{y}`,
      tileOptions: {
        tileSize: 256,
        minZoom: 1,
        maxZoom: 5,
        maxNativeZoom: 5,
        minNativeZoom: 1,
        tms: true,
      },
      crs: { type: "transformation", params: [1 / 64, 128, -1 / 64, 128] },
      defaultCenter: [0, 0],
      defaultZoom: 3,
    };
  }

  async getPlayerPositions(): Promise<Player[]> {
    try {
      const players = await this.fetchApi<FiveMPlayerPos[]>(
        `/${this.resourceName}/players`,
      );
      return players.map((p) => ({
        id: String(p.id),
        name: p.name,
        online: true,
        ping: p.ping,
        position: { x: p.x, y: p.y, z: p.z },
        gameSpecific: {},
      }));
    } catch {
      return [];
    }
  }

  async getBlips(): Promise<MapBlip[]> {
    try {
      const raw = await this.fetchApi<FiveMBlipRaw[]>(
        `/${this.resourceName}/blips`,
      );
      const seen = new Set<string>();
      const blips: MapBlip[] = [];
      for (const b of raw) {
        const key = `${b.sprite}_${Math.round(b.x)}_${Math.round(b.y)}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const style = getBlipStyle(b.sprite);
        blips.push({
          id: key,
          x: b.x,
          y: b.y,
          label: style.label,
          color: style.color,
          category: style.label,
          radius: style.radius,
        });
      }
      return blips;
    } catch {
      return [];
    }
  }

  async getServerSettings(): Promise<Record<string, { label: string; value: string }>> {
    const info = await this.fetchApi<FiveMInfo>("/info.json");
    const dyn = await this.fetchApi<FiveMDynamic>("/dynamic.json");

    const framework = info.resources.includes("qbx_core") ? "QBox" :
      info.resources.includes("qb-core") ? "QBCore" :
      info.resources.includes("es_extended") ? "ESX" : "—";

    return {
      framework: { label: "Framework", value: framework },
      maxPlayers: { label: "Max Players", value: dyn.sv_maxclients },
      oxLib: { label: "ox_lib", value: info.resources.includes("ox_lib") ? "Yes" : "—" },
      inventory: { label: "Inventory", value: info.resources.includes("ox_inventory") ? "ox_inventory" : "—" },
      phone: { label: "Phone", value: info.resources.includes("lb-phone") ? "lb-phone" : info.resources.includes("npwd") ? "NPWD" : "—" },
      voice: { label: "Voice", value: info.resources.includes("pma-voice") ? "pma-voice" : "—" },
    };
  }

  async proxyRequest(path: string): Promise<Response> {
    // Proxy map tiles from GitHub
    const url = `${TILE_BASE_URL}/${path}.webp`;
    return fetch(url, { next: { revalidate: 86400 } });
  }
}

export { BLIP_CATEGORIES };

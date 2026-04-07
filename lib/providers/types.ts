/**
 * Gamewatch — Provider interface
 * Every game provider implements this to expose a normalized API.
 */

export interface ProviderCapabilities {
  hasMap: boolean;
  hasPlayerPositions: boolean;
  hasBlips: boolean;
  hasRankings: boolean;
  hasModList: boolean;
  hasServerSettings: boolean;
  hasGameEvents: boolean;
}

export interface ServerStatus {
  online: boolean;
  playerCount: number;
  maxPlayers: number;
  version: string;
  serverName: string;
  mapName?: string;
  /** Game-specific data (blood moon, gametime, etc.) */
  gameSpecific: Record<string, unknown>;
}

export interface Player {
  id: string;
  name: string;
  online: boolean;
  ping?: number;
  /** Total playtime in minutes */
  playtime?: number;
  /** ISO 8601 date string */
  lastSeen?: string;
  position?: { x: number; y: number; z: number };
  /** Game-specific data (level, kills, deaths, score, health, etc.) */
  gameSpecific: Record<string, unknown>;
}

export interface ModEntry {
  name: string;
  version?: string;
  description?: string;
  category?: string;
  url?: string;
}

export interface MapConfig {
  tileUrl: string;
  tileOptions: {
    tileSize: number;
    minZoom: number;
    maxZoom: number;
    maxNativeZoom?: number;
    minNativeZoom?: number;
    tms?: boolean;
    flipY?: boolean;
  };
  /** Leaflet CRS configuration */
  crs:
    | { type: "simple" }
    | {
        type: "sdtd";
        maxZoom: number;
      }
    | {
        type: "transformation";
        params: [number, number, number, number];
      };
  defaultCenter: [number, number];
  defaultZoom: number;
}

export interface MapBlip {
  id: string;
  x: number;
  y: number;
  label: string;
  color: string;
  category?: string;
  radius?: number;
}

export interface GameEvent {
  type: string;
  label: string;
  value: string;
  color?: string;
}

export interface ServerSetting {
  label: string;
  value: string;
}

export interface GameProvider {
  readonly id: string;
  readonly displayName: string;
  readonly capabilities: ProviderCapabilities;

  getStatus(): Promise<ServerStatus>;
  getPlayers(): Promise<Player[]>;
  getMods?(): Promise<ModEntry[]>;
  getMapConfig?(): MapConfig;
  getPlayerPositions?(): Promise<Player[]>;
  getBlips?(): Promise<MapBlip[]>;
  getServerSettings?(): Promise<Record<string, ServerSetting>>;
  getGameEvents?(): Promise<GameEvent[]>;
  proxyRequest?(path: string): Promise<Response>;
}

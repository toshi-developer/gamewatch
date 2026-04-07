/**
 * 7 Days to Die — Allocs Web API client
 * Endpoints: /api/getstats, /api/getserverinfo, /api/getplayersonline, /api/getplayerlist
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServerStats {
  gametime: {
    days: number;
    hours: number;
    minutes: number;
  };
  players: number;
  hostiles: number;
  animals: number;
}

export interface ServerInfo {
  GameType: { type: "string"; value: string };
  GameName: { type: "string"; value: string };
  GameHost: { type: "string"; value: string };
  ServerDescription: { type: "string"; value: string };
  ServerWebsiteURL: { type: "string"; value: string };
  LevelName: { type: "string"; value: string };
  GameDifficulty: { type: "int"; value: number };
  DayNightLength: { type: "int"; value: number };
  BlockDurabilityModifier: { type: "int"; value: number };
  AirDropFrequency: { type: "int"; value: number };
  AirDropMarker: { type: "bool"; value: boolean };
  MaxSpawnedZombies: { type: "int"; value: number };
  LootAbundance: { type: "int"; value: number };
  LootRespawnDays: { type: "int"; value: number };
  LandClaimSize: { type: "int"; value: number };
  MaxPlayers: { type: "int"; value: number };
  CurrentPlayers: { type: "int"; value: number };
  CurrentServerTime: { type: "int"; value: number };
  DayCount: { type: "int"; value: number };
  BloodMoonFrequency: { type: "int"; value: number };
  Version: { type: "string"; value: string };
  IP: { type: "string"; value: string };
  Port: { type: "int"; value: number };
  [key: string]: { type: string; value: string | number | boolean };
}

export interface OnlinePlayer {
  steamid: string;
  entityid: number;
  ip: string;
  name: string;
  online: boolean;
  position: { x: number; y: number; z: number };
  level: number;
  health: number;
  stamina: number;
  zombiekills: number;
  playerkills: number;
  playerdeaths: number;
  score: number;
  totalplaytime: number;
  lastonline: string;
  ping: number;
}

export interface PlayerListEntry {
  steamid: string;
  name: string;
  online: boolean;
  ip: string;
  totalplaytime: number;
  lastonline: string;
  banned: boolean;
}

export interface PlayerListResponse {
  total: number;
  totalUnfiltered: number;
  players: PlayerListEntry[];
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const API_BASE = process.env.SDTD_API_URL ?? "http://127.0.0.1:8081";
const TOKEN_NAME = process.env.SDTD_API_TOKEN_NAME ?? "";
const TOKEN_SECRET = process.env.SDTD_API_TOKEN_SECRET ?? "";

function headers(): HeadersInit {
  const h: HeadersInit = { Accept: "application/json" };
  if (TOKEN_NAME && TOKEN_SECRET) {
    h["X-SDTD-API-TOKENNAME"] = TOKEN_NAME;
    h["X-SDTD-API-SECRET"] = TOKEN_SECRET;
  }
  return h;
}

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`7DTD API error: ${res.status} ${res.statusText} (${path})`);
  }
  return res.json() as Promise<T>;
}

export async function getStats(): Promise<ServerStats> {
  return fetchApi<ServerStats>("/api/getstats");
}

export async function getServerInfo(): Promise<ServerInfo> {
  return fetchApi<ServerInfo>("/api/getserverinfo");
}

export async function getPlayersOnline(): Promise<OnlinePlayer[]> {
  return fetchApi<OnlinePlayer[]>("/api/getplayersonline");
}

export async function getPlayerList(
  count = 100,
  offset = 0,
): Promise<PlayerListResponse> {
  return fetchApi<PlayerListResponse>(
    `/api/getplayerlist?rowsperpage=${count}&page=${offset}`,
  );
}

// ---------------------------------------------------------------------------
// Derived helpers
// ---------------------------------------------------------------------------

/** Blood Moon occurs every N days (default 7). Returns days until next. */
export function daysUntilBloodMoon(
  currentDay: number,
  frequency = 7,
): number {
  if (frequency <= 0) return -1;
  const remainder = currentDay % frequency;
  return remainder === 0 ? 0 : frequency - remainder;
}

/** Format total playtime (minutes) to human-readable */
export function formatPlaytime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}分`;
  return `${h}時間${m > 0 ? `${m}分` : ""}`;
}

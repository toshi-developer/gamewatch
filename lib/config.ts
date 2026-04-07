import { readFileSync, existsSync } from "fs";
import { parse as parseYaml } from "yaml";
import { configSchema, type GamewatchConfig, type ServerConfig } from "./config.schema";

let cached: GamewatchConfig | null = null;

/**
 * Load config from YAML + env var overrides.
 *
 * Priority:
 * 1. GAMEWATCH_* env var overrides
 * 2. YAML file (path from GAMEWATCH_CONFIG or ./gamewatch.yaml)
 * 3. Legacy env vars (SDTD_API_URL, FIVEM_API_URL) as fallback
 */
export function getConfig(): GamewatchConfig {
  if (cached) return cached;

  let raw: Record<string, unknown> = {};

  // Try loading YAML config file
  const configPath =
    process.env.GAMEWATCH_CONFIG ?? "./gamewatch.yaml";
  if (existsSync(configPath)) {
    try {
      const content = readFileSync(configPath, "utf-8");
      raw = parseYaml(content) as Record<string, unknown>;
    } catch (err) {
      console.error(`[gamewatch] Failed to parse ${configPath}:`, err);
    }
  }

  // Apply GAMEWATCH_SITE_* env var overrides
  const site = (raw.site ?? {}) as Record<string, unknown>;
  if (process.env.GAMEWATCH_SITE_NAME) site.name = process.env.GAMEWATCH_SITE_NAME;
  if (process.env.GAMEWATCH_SITE_LOCALE) site.locale = process.env.GAMEWATCH_SITE_LOCALE;
  if (process.env.GAMEWATCH_SITE_REFRESH_INTERVAL)
    site.refreshInterval = Number(process.env.GAMEWATCH_SITE_REFRESH_INTERVAL);
  raw.site = site;

  // Apply per-server env var overrides (GAMEWATCH_SERVERS_0_API_URL, etc.)
  if (raw.servers && Array.isArray(raw.servers)) {
    for (let i = 0; i < raw.servers.length; i++) {
      const prefix = `GAMEWATCH_SERVERS_${i}_`;
      const server = raw.servers[i] as Record<string, unknown>;
      if (process.env[`${prefix}API_URL`]) server.apiUrl = process.env[`${prefix}API_URL`];
      if (process.env[`${prefix}LABEL`]) server.label = process.env[`${prefix}LABEL`];
    }
  }

  // Legacy env var fallback: auto-generate servers if no config file found
  if (!raw.servers || (Array.isArray(raw.servers) && raw.servers.length === 0)) {
    const servers: Partial<ServerConfig>[] = [];

    if (process.env.SDTD_API_URL) {
      servers.push({
        id: "sdtd",
        game: "sdtd",
        label: "7 Days to Die",
        apiUrl: process.env.SDTD_API_URL,
        auth: {
          tokenName: process.env.SDTD_API_TOKEN_NAME,
          tokenSecret: process.env.SDTD_API_TOKEN_SECRET,
        },
      });
    }

    if (process.env.FIVEM_API_URL) {
      servers.push({
        id: "fivem",
        game: "fivem",
        label: "FiveM",
        apiUrl: process.env.FIVEM_API_URL,
      });
    }

    if (servers.length > 0) {
      raw.servers = servers;
    }
  }

  const result = configSchema.parse(raw);
  cached = result;
  return result;
}

export function getServerConfig(serverId: string): ServerConfig | undefined {
  return getConfig().servers.find((s) => s.id === serverId);
}

/** Invalidate the cached config (useful for testing) */
export function resetConfig(): void {
  cached = null;
}

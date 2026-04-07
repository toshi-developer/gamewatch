import { InfluxDB } from "@influxdata/influxdb-client";
import { getConfig, getServerConfig } from "./config";

export interface HistoryPoint {
  time: string;
  players: number;
  maxPlayers: number;
  isAlive: boolean;
  latencyMs?: number;
  cpuUsage?: number;
  memUsage?: number;
}

function getClient(): InfluxDB | null {
  const { influxdb } = getConfig();
  if (!influxdb) return null;
  return new InfluxDB({ url: influxdb.url, token: influxdb.token });
}

/**
 * Query player count + server status history from InfluxDB.
 * @param serverId — gamewatch server ID
 * @param range — Flux range string, e.g. "-24h", "-7d"
 */
export async function getHistory(
  serverId: string,
  range = "-24h",
): Promise<HistoryPoint[]> {
  const config = getConfig();
  const influx = config.influxdb;
  if (!influx) return [];

  const client = getClient();
  if (!client) return [];

  const serverConfig = getServerConfig(serverId);
  if (!serverConfig) return [];

  // monitorName maps to the server_name tag in InfluxDB
  const serverName = serverConfig.monitorName ?? serverConfig.label;

  const queryApi = client.getQueryApi(influx.org);

  // Aggregate to ~100 data points for chart readability
  const windowMap: Record<string, string> = {
    "-1h": "1m",
    "-6h": "5m",
    "-24h": "15m",
    "-7d": "1h",
    "-30d": "6h",
  };
  const window = windowMap[range] ?? "15m";

  const query = `
    from(bucket: "${influx.bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r._measurement == "server_metrics")
      |> filter(fn: (r) => r.server_name == "${serverName}")
      |> filter(fn: (r) => r._field == "players" or r._field == "max_players" or r._field == "is_alive" or r._field == "latency_ms" or r._field == "cpu_usage" or r._field == "mem_usage")
      |> aggregateWindow(every: ${window}, fn: last, createEmpty: false)
      |> pivot(rowKey: ["_time"], columnKey: ["_field"], valueColumn: "_value")
      |> sort(columns: ["_time"])
  `;

  const points: HistoryPoint[] = [];

  try {
    const rows = queryApi.iterateRows(query);
    for await (const { values, tableMeta } of rows) {
      const row = tableMeta.toObject(values);
      points.push({
        time: String(row._time),
        players: Number(row.players ?? 0),
        maxPlayers: Number(row.max_players ?? 0),
        isAlive: Number(row.is_alive ?? 0) === 1,
        latencyMs: row.latency_ms != null ? Number(row.latency_ms) : undefined,
        cpuUsage: row.cpu_usage != null ? Number(row.cpu_usage) : undefined,
        memUsage: row.mem_usage != null ? Number(row.mem_usage) : undefined,
      });
    }
  } catch (err) {
    console.error("[influx] Query failed:", err);
  }

  return points;
}

/** Check if InfluxDB integration is configured */
export function isInfluxEnabled(): boolean {
  return !!getConfig().influxdb;
}

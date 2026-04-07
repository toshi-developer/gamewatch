import type { Player, ServerStatus } from "@/lib/providers/types";

export function SdtdExtras({
  players,
  status,
}: {
  players: Player[];
  status: ServerStatus;
}) {
  const onlinePlayers = players.filter((p) => p.online);
  if (onlinePlayers.length === 0) return null;

  const totalKills = onlinePlayers.reduce(
    (s, p) => s + Number(p.gameSpecific.zombiekills ?? 0),
    0,
  );
  const totalDeaths = onlinePlayers.reduce(
    (s, p) => s + Number(p.gameSpecific.playerdeaths ?? 0),
    0,
  );
  const totalPlaytime = onlinePlayers.reduce(
    (s, p) => s + (p.playtime ?? 0),
    0,
  );
  const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(1) : "—";
  const killsPerHour =
    totalPlaytime > 0
      ? ((totalKills / totalPlaytime) * 60).toFixed(1)
      : "—";

  // Top killer
  const topKiller = [...onlinePlayers].sort(
    (a, b) =>
      Number(b.gameSpecific.zombiekills ?? 0) -
      Number(a.gameSpecific.zombiekills ?? 0),
  )[0];

  return (
    <div className="flex flex-wrap gap-6 rounded-xl border border-card-border bg-card px-5 py-3 text-sm">
      <Stat label="Zombie Kills" value={totalKills.toLocaleString()} color="text-accent" />
      <Stat label="Deaths" value={totalDeaths.toLocaleString()} color="text-red" />
      <Stat label="K/D" value={kd} />
      <Stat label="Kills/h" value={killsPerHour} />
      {topKiller && (
        <Stat
          label="Top Killer"
          value={`${topKiller.name} (${Number(topKiller.gameSpecific.zombiekills ?? 0).toLocaleString()})`}
          color="text-accent"
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <span>
      {label}:{" "}
      <strong className={`tabular-nums ${color ?? ""}`}>{value}</strong>
    </span>
  );
}

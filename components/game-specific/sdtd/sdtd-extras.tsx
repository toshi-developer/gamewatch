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

  return (
    <div className="flex flex-wrap gap-6 rounded-xl border border-card-border bg-card px-5 py-3 text-sm">
      <span>
        Zombie Kills:{" "}
        <strong className="text-accent tabular-nums">
          {totalKills.toLocaleString()}
        </strong>
      </span>
      <span>
        Deaths:{" "}
        <strong className="text-red tabular-nums">
          {totalDeaths.toLocaleString()}
        </strong>
      </span>
      <span>
        K/D:{" "}
        <strong className="tabular-nums">
          {totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(1) : "—"}
        </strong>
      </span>
    </div>
  );
}

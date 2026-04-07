import type { Player } from "@/lib/providers/types";
import type { GameType } from "@/lib/config.schema";
import { t } from "@/lib/i18n";
import { Card } from "./card";

const MEDALS = ["🥇", "🥈", "🥉"];

function formatPlaytime(minutes?: number): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h${m > 0 ? `${m}m` : ""}`;
}

function RankRow({
  rank,
  name,
  value,
  online,
}: {
  rank: number;
  name: string;
  value: string;
  online: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-6 text-center text-sm">
        {MEDALS[rank] ?? <span className="text-xs text-muted">{rank + 1}</span>}
      </span>
      <span className={`flex-1 text-sm font-medium${online ? " text-green" : ""}`}>
        {name}
      </span>
      <span className="tabular-nums text-sm">{value}</span>
    </div>
  );
}

export function Ranking({
  players,
  game,
}: {
  players: Player[];
  game: GameType;
}) {
  if (players.length === 0) return null;

  const rankings: Array<{
    title: string;
    key: string;
    format: (p: Player) => string;
    getValue: (p: Player) => number;
  }> = [];

  if (game === "sdtd") {
    rankings.push({
      title: t("ranking.zombieKills"),
      key: "zombiekills",
      getValue: (p) => Number(p.gameSpecific.zombiekills ?? 0),
      format: (p) => Number(p.gameSpecific.zombiekills ?? 0).toLocaleString(),
    });
  }

  rankings.push({
    title: t("ranking.playtime"),
    key: "playtime",
    getValue: (p) => p.playtime ?? 0,
    format: (p) => formatPlaytime(p.playtime),
  });

  const filtered = rankings
    .map((r) => ({
      ...r,
      top: [...players]
        .sort((a, b) => r.getValue(b) - r.getValue(a))
        .slice(0, 5)
        .filter((p) => r.getValue(p) > 0),
    }))
    .filter((r) => r.top.length > 0);

  if (filtered.length === 0) return null;

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {filtered.map((r) => (
        <Card key={r.key} title={r.title}>
          <div className="flex flex-col gap-2.5">
            {r.top.map((p, i) => (
              <RankRow
                key={p.id}
                rank={i}
                name={p.name}
                value={r.format(p)}
                online={p.online}
              />
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}

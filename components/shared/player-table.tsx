import type { Player } from "@/lib/providers/types";
import type { GameType } from "@/lib/config.schema";
import { t } from "@/lib/i18n";
import { Card } from "./card";

function formatLastSeen(iso?: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t("common.justNow");
    if (mins < 60) return t("common.minutesAgo", { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t("common.hoursAgo", { n: hours });
    const days = Math.floor(hours / 24);
    return t("common.daysAgo", { n: days });
  } catch {
    return "—";
  }
}

function formatPlaytime(minutes?: number): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h${m > 0 ? `${m}m` : ""}`;
}

export function PlayerTable({
  players,
  game,
  onlineCount,
  totalCount,
}: {
  players: Player[];
  game: GameType;
  onlineCount: number;
  totalCount: number;
}) {
  if (players.length === 0) {
    return (
      <Card title={t("players.title")}>
        <p className="py-8 text-center text-sm text-muted">
          {t("players.none")}
        </p>
      </Card>
    );
  }

  const online = players.filter((p) => p.online).sort((a, b) => {
    const la = Number(a.gameSpecific.level ?? 0);
    const lb = Number(b.gameSpecific.level ?? 0);
    return lb - la;
  });
  const offline = players.filter((p) => !p.online).sort((a, b) => {
    const ta = a.lastSeen ? new Date(a.lastSeen).getTime() : 0;
    const tb = b.lastSeen ? new Date(b.lastSeen).getTime() : 0;
    return tb - ta;
  });

  const has7dtdStats = game === "sdtd";

  return (
    <Card
      title={`${t("players.title")}（${t("players.online", { n: onlineCount })} / ${t("players.registered", { n: totalCount })}）`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-xs text-muted">
              <th className="pb-2 pr-4">{t("players.status")}</th>
              <th className="pb-2 pr-4">{t("players.name")}</th>
              {has7dtdStats && (
                <>
                  <th className="pb-2 pr-4 text-right">{t("players.level")}</th>
                  <th className="pb-2 pr-4 text-right">Kills</th>
                  <th className="pb-2 pr-4 text-right">Deaths</th>
                </>
              )}
              <th className="pb-2 pr-4 text-right">{t("players.playtime")}</th>
              <th className="pb-2 text-right">{t("players.lastSeen")}</th>
            </tr>
          </thead>
          <tbody>
            {online.map((p) => (
              <tr
                key={p.id}
                className="border-b border-card-border/50 last:border-0"
              >
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-green animate-pulse-dot" />
                    <span className="text-xs text-green">{t("common.on")}</span>
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                {has7dtdStats && (
                  <>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-accent">
                      {Number(p.gameSpecific.level ?? 0) || "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {Number(p.gameSpecific.zombiekills ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-red">
                      {Number(p.gameSpecific.playerdeaths ?? 0)}
                    </td>
                  </>
                )}
                <td className="py-2.5 pr-4 text-right text-xs text-muted">
                  {formatPlaytime(p.playtime)}
                </td>
                <td className="py-2.5 text-right text-xs text-muted">—</td>
              </tr>
            ))}
            {offline.map((p) => (
              <tr
                key={p.id}
                className="border-b border-card-border/50 opacity-60 last:border-0"
              >
                <td className="py-2.5 pr-4">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                    <span className="text-xs text-muted">{t("common.off")}</span>
                  </span>
                </td>
                <td className="py-2.5 pr-4 font-medium">{p.name}</td>
                {has7dtdStats && (
                  <>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-muted">—</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-muted">—</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-muted">—</td>
                  </>
                )}
                <td className="py-2.5 pr-4 text-right text-xs text-muted">
                  {formatPlaytime(p.playtime)}
                </td>
                <td className="py-2.5 text-right text-xs text-muted">
                  {formatLastSeen(p.lastSeen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

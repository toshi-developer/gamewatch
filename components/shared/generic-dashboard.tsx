import Link from "next/link";
import type { ServerStatus, Player, ModEntry, MapConfig, ServerSetting, GameProvider } from "@/lib/providers/types";
import type { ServerConfig } from "@/lib/config.schema";
import { t } from "@/lib/i18n";
import { Card } from "./card";
import { StatBlock } from "./stat-block";
import { AutoRefresh } from "./auto-refresh";
import { ServerSettings } from "./server-settings";
import { PlayerTable } from "./player-table";
import { ModList } from "./mod-list";
import { GameMapWrapper } from "./game-map/map-wrapper";
import { HistoryChart } from "./history-chart";
import { Announcement } from "./announcement";
import { SocialLinks } from "./social-links";
import { isInfluxEnabled } from "@/lib/influx";

export function GenericDashboard({
  serverConfig,
  status,
  isLive,
  players,
  settings,
  mods,
  mapConfig,
  provider,
}: {
  serverConfig: ServerConfig;
  status: ServerStatus;
  isLive: boolean;
  players: Player[];
  settings?: Record<string, ServerSetting>;
  mods?: ModEntry[];
  mapConfig?: MapConfig;
  provider: GameProvider;
}) {
  const onlinePlayers = players.filter((p) => p.online);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-8">
      <nav className="flex items-center gap-3 text-sm text-muted">
        <Link href="/" className="hover:text-accent">{t("home.title")}</Link>
        <span>/</span>
        <span className="text-foreground">{serverConfig.label}</span>
      </nav>

      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-accent">{provider.displayName}</span>{" "}
            {t("server.status")}
          </h1>
          <p className="text-sm text-muted">{status.serverName}</p>
        </div>
        <div className="flex items-center gap-3">
          <AutoRefresh serverId={serverConfig.id} />
          <Link
            href={`/servers/${serverConfig.id}/admin`}
            className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            Admin
          </Link>
        </div>
      </header>

      {serverConfig.announcement && <Announcement text={serverConfig.announcement} />}
      {serverConfig.links && serverConfig.links.length > 0 && <SocialLinks links={serverConfig.links} />}

      <Card title={t("server.status")}>
        <div className="flex flex-wrap gap-6">
          <StatBlock
            label={t("server.status")}
            value={isLive ? t("server.online") : t("server.offline")}
            color={isLive ? "text-green" : "text-red"}
          />
          <StatBlock label={t("server.players")} value={`${status.playerCount} / ${status.maxPlayers}`} color="text-accent" />
          {status.version && <StatBlock label="Version" value={status.version} />}
        </div>
      </Card>

      {isInfluxEnabled() && <HistoryChart serverId={serverConfig.id} />}
      {settings && Object.keys(settings).length > 0 && <ServerSettings settings={settings} />}
      {mapConfig && <GameMapWrapper serverId={serverConfig.id} mapConfig={mapConfig} />}

      <PlayerTable players={players} game={serverConfig.game} onlineCount={onlinePlayers.length} totalCount={players.length} />
      {mods && mods.length > 0 && <ModList mods={mods} game={serverConfig.game} />}
    </div>
  );
}

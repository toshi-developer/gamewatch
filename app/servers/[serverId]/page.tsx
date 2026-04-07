import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerConfig } from "@/lib/config";
import { getProvider } from "@/lib/registry";
import { t } from "@/lib/i18n";
import { Card } from "@/components/shared/card";
import { StatBlock } from "@/components/shared/stat-block";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { ServerSettings } from "@/components/shared/server-settings";
import { PlayerTable } from "@/components/shared/player-table";
import { GameEvents } from "@/components/shared/game-events";
import { ModList } from "@/components/shared/mod-list";
import { Ranking } from "@/components/shared/ranking";
import { GameMapWrapper } from "@/components/shared/game-map/map-wrapper";
import { SdtdExtras } from "@/components/game-specific/sdtd/sdtd-extras";
import { BloodMoonBar } from "@/components/game-specific/sdtd/blood-moon-bar";
import { DayNightIndicator } from "@/components/game-specific/sdtd/day-night-indicator";
import { BlipLegend } from "@/components/game-specific/fivem/blip-legend";
import { HistoryChart } from "@/components/shared/history-chart";
import { Announcement } from "@/components/shared/announcement";
import { SocialLinks } from "@/components/shared/social-links";
import { isInfluxEnabled } from "@/lib/influx";

export const dynamic = "force-dynamic";

export default async function ServerPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;
  const serverConfig = getServerConfig(serverId);
  if (!serverConfig) notFound();

  const provider = getProvider(serverId);
  const cap = provider.capabilities;

  let status;
  let isLive = true;
  try {
    status = await provider.getStatus();
  } catch {
    isLive = false;
    status = {
      online: false,
      playerCount: 0,
      maxPlayers: 0,
      version: "",
      serverName: serverConfig.label,
      gameSpecific: {},
    };
  }

  const players = isLive ? await provider.getPlayers().catch(() => []) : [];
  const settings = cap.hasServerSettings
    ? await provider.getServerSettings?.().catch(() => ({}))
    : undefined;
  const events = cap.hasGameEvents
    ? await provider.getGameEvents?.().catch(() => [])
    : undefined;
  const mods = cap.hasModList
    ? await provider.getMods?.().catch(() => [])
    : undefined;
  const mapConfig = cap.hasMap ? provider.getMapConfig?.() : undefined;

  const onlinePlayers = players.filter((p) => p.online);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-8">
      {/* Nav */}
      <nav className="flex items-center gap-3 text-sm text-muted">
        <Link href="/" className="hover:text-accent">
          {t("home.title")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{serverConfig.label}</span>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-accent">{provider.displayName}</span>{" "}
            {t("server.status")}
          </h1>
          <p className="text-sm text-muted">{status.serverName}</p>
        </div>
        <div className="flex items-center gap-3">
          <AutoRefresh serverId={serverId} />
          <Link
            href={`/servers/${serverId}/admin`}
            className="rounded-lg border border-card-border px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Announcement Banner */}
      {serverConfig.announcement && (
        <Announcement text={serverConfig.announcement} />
      )}

      {/* Social Links */}
      {serverConfig.links && serverConfig.links.length > 0 && (
        <SocialLinks links={serverConfig.links} />
      )}

      {/* Status Card */}
      <Card title={t("server.status")}>
        <div className="flex flex-wrap gap-6">
          <StatBlock
            label={t("server.status")}
            value={isLive ? t("server.online") : t("server.offline")}
            color={isLive ? "text-green" : "text-red"}
          />
          <StatBlock
            label={t("server.players")}
            value={`${status.playerCount} / ${status.maxPlayers}`}
            color="text-accent"
          />
          {status.version && (
            <StatBlock label="Version" value={status.version} />
          )}
          {status.mapName && (
            <StatBlock label="Map" value={status.mapName} />
          )}
        </div>
      </Card>

      {/* 7DTD: Blood Moon + Day/Night + Kill Stats */}
      {serverConfig.game === "sdtd" && (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            <BloodMoonBar status={status} />
            <DayNightIndicator status={status} />
          </div>
          <SdtdExtras players={players} status={status} />
        </>
      )}

      {/* Other game events (fallback for non-7DTD) */}
      {serverConfig.game !== "sdtd" && events && events.length > 0 && (
        <GameEvents events={events} />
      )}

      {/* History Chart (from game-monitor-agent / InfluxDB) */}
      {isInfluxEnabled() && <HistoryChart serverId={serverId} />}

      {/* Server Settings */}
      {settings && Object.keys(settings).length > 0 && (
        <ServerSettings settings={settings} />
      )}

      {/* Map */}
      {mapConfig && (
        <>
          <GameMapWrapper serverId={serverId} mapConfig={mapConfig} />
          {serverConfig.game === "fivem" && <BlipLegend />}
        </>
      )}

      {/* Rankings */}
      {cap.hasRankings && players.length > 0 && (
        <Ranking players={players} game={serverConfig.game} />
      )}

      {/* Player List */}
      <PlayerTable
        players={players}
        game={serverConfig.game}
        onlineCount={onlinePlayers.length}
        totalCount={players.length}
      />

      {/* Mod / Resource List */}
      {mods && mods.length > 0 && (
        <ModList mods={mods} game={serverConfig.game} />
      )}
    </div>
  );
}

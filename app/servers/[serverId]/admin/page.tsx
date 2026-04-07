import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerConfig } from "@/lib/config";
import { getProvider } from "@/lib/registry";
import { isAuthenticated, isAdminEnabled } from "@/lib/admin-auth";
import { isInfluxEnabled } from "@/lib/influx";
import { t } from "@/lib/i18n";
import { Card } from "@/components/shared/card";
import { StatBlock } from "@/components/shared/stat-block";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { HistoryChart } from "@/components/shared/history-chart";

export const dynamic = "force-dynamic";

export default async function ServerAdminPage({
  params,
}: {
  params: Promise<{ serverId: string }>;
}) {
  const { serverId } = await params;

  // Auth check
  if (isAdminEnabled() && !(await isAuthenticated())) {
    redirect("/admin");
  }

  const serverConfig = getServerConfig(serverId);
  if (!serverConfig) notFound();

  const provider = getProvider(serverId);

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

  // 7DTD specific: hostiles, animals from gameSpecific
  const hostiles = Number(status.gameSpecific.hostiles ?? 0);
  const animals = Number(status.gameSpecific.animals ?? 0);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 px-4 py-8">
      {/* Nav */}
      <nav className="flex items-center gap-3 text-sm text-muted">
        <Link href="/" className="hover:text-accent">
          {t("home.title")}
        </Link>
        <span>/</span>
        <Link href={`/servers/${serverId}`} className="hover:text-accent">
          {serverConfig.label}
        </Link>
        <span>/</span>
        <span className="text-foreground">Admin</span>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-accent">{provider.displayName}</span> Admin
          </h1>
          <p className="text-sm text-muted">{status.serverName}</p>
        </div>
        <AutoRefresh serverId={serverId} />
      </header>

      {/* Status + Load */}
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
          {serverConfig.game === "sdtd" && (
            <>
              <StatBlock
                label="Hostiles"
                value={hostiles}
                color={hostiles > 30 ? "text-red" : hostiles > 10 ? "text-yellow" : "text-foreground"}
              />
              <StatBlock label="Animals" value={animals} />
            </>
          )}
          {serverConfig.game === "fivem" && (
            <StatBlock
              label="Resources"
              value={Number(status.gameSpecific.resourceCount ?? 0)}
            />
          )}
        </div>
      </Card>

      {/* History Charts with System tab */}
      {isInfluxEnabled() && (
        <HistoryChart serverId={serverId} showSystem />
      )}

      {/* Server Config Details */}
      <Card title="Server Configuration">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              <ConfigRow label="Server ID" value={serverConfig.id} />
              <ConfigRow label="Game" value={serverConfig.game} />
              <ConfigRow label="API URL" value={serverConfig.apiUrl} />
              {serverConfig.monitorName && (
                <ConfigRow label="Monitor Name" value={serverConfig.monitorName} />
              )}
              {serverConfig.resourceName && (
                <ConfigRow label="FiveM Resource" value={serverConfig.resourceName} />
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-card-border/30 last:border-0">
      <td className="py-2 pr-4 text-xs text-muted">{label}</td>
      <td className="py-2 font-mono text-xs">{value}</td>
    </tr>
  );
}

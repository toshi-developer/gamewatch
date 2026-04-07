import { notFound } from "next/navigation";
import { getServerConfig } from "@/lib/config";
import { getProvider } from "@/lib/registry";
import { SdtdDashboard } from "@/components/game-specific/sdtd/sdtd-dashboard";
import { FiveMDashboard } from "@/components/game-specific/fivem/fivem-dashboard";
import { GenericDashboard } from "@/components/shared/generic-dashboard";

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
    ? await provider.getServerSettings?.().catch(() => undefined)
    : undefined;
  const mods = cap.hasModList
    ? await provider.getMods?.().catch(() => undefined)
    : undefined;
  const mapConfig = cap.hasMap ? provider.getMapConfig?.() : undefined;

  const props = { serverConfig, status, isLive, players, settings, mods, mapConfig };

  switch (serverConfig.game) {
    case "sdtd":
      return <SdtdDashboard {...props} />;
    case "fivem":
      return <FiveMDashboard {...props} />;
    default:
      return <GenericDashboard {...props} provider={provider} />;
  }
}

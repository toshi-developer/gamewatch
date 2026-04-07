import Link from "next/link";
import { Users, ShieldCheck, UserX } from "lucide-react";
import type { ServerStatus, Player, ModEntry, MapConfig, ServerSetting } from "@/lib/providers/types";
import type { ServerConfig } from "@/lib/config.schema";
import { t } from "@/lib/i18n";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { GameMapWrapper } from "@/components/shared/game-map/map-wrapper";
import { HistoryChart } from "@/components/shared/history-chart";
import { Announcement } from "@/components/shared/announcement";
import { SocialLinks } from "@/components/shared/social-links";
import { isInfluxEnabled } from "@/lib/influx";

function GlassPanel({
  children,
  className = "",
  neon,
}: {
  children: React.ReactNode;
  className?: string;
  neon?: "purple" | "cyan";
}) {
  const neonClass = neon === "purple" ? "neon-border-purple" : neon === "cyan" ? "neon-border-cyan" : "";
  return (
    <div className={`glass-panel ${neonClass} ${className}`}>
      {children}
    </div>
  );
}

function StatCard({
  label,
  value,
  color = "purple",
}: {
  label: string;
  value: string;
  color?: "purple" | "cyan" | "blue" | "pink";
}) {
  const colorMap = {
    purple: "border-purple-500/30 text-purple-400",
    cyan: "border-cyan-500/30 text-cyan-400",
    blue: "border-blue-500/30 text-blue-400",
    pink: "border-pink-500/30 text-pink-400",
  };
  return (
    <div className={`glass-panel flex flex-col items-center justify-center border-2 p-3 transition-all hover:scale-105 ${colorMap[color]}`}>
      <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
      <span className="text-sm font-black tracking-tight">{value}</span>
    </div>
  );
}

export function FiveMDashboard({
  serverConfig,
  status,
  isLive,
  players,
  settings,
  mods,
  mapConfig,
}: {
  serverConfig: ServerConfig;
  status: ServerStatus;
  isLive: boolean;
  players: Player[];
  settings?: Record<string, ServerSetting>;
  mods?: ModEntry[];
  mapConfig?: MapConfig;
}) {
  const framework = String(status.gameSpecific.framework ?? "");
  const settingsEntries = settings ? Object.values(settings) : [];

  return (
    <div className="theme-fivem min-h-screen p-4 md:p-8 lg:p-12">
      <div className="mx-auto max-w-7xl">
        {/* Nav */}
        <nav className="mb-4 flex items-center gap-3 text-xs text-white/30">
          <Link href="/" className="hover:text-white/60">{t("home.title")}</Link>
          <span>/</span>
          <span className="text-white/60">{serverConfig.label}</span>
        </nav>

        {/* Header */}
        <GlassPanel neon="purple" className="mb-6 flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-black tracking-tighter text-white">
              FIVE<span className="text-cyan-400">M</span>
            </div>
            <div className={`flex items-center gap-2 rounded border px-2 py-1 ${isLive ? "border-green-500/50 bg-green-500/20" : "border-red-500/50 bg-red-500/20"}`}>
              <div className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <span className={`text-xs font-bold uppercase tracking-widest ${isLive ? "text-green-500" : "text-red-500"}`}>
                {isLive ? "Live" : "Offline"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-white/80">
                <Users size={16} className="text-cyan-400" />
                <span className="text-sm font-bold">{status.playerCount} / {status.maxPlayers} PLAYERS</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-tighter text-white/40">
                <AutoRefresh serverId={serverConfig.id} />
                <span className="mx-1">|</span>
                <ShieldCheck size={10} />
                <Link href={`/servers/${serverConfig.id}/admin`} className="hover:text-white/60">Admin</Link>
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Announcement + Links */}
        {serverConfig.announcement && (
          <div className="mb-4">
            <Announcement text={serverConfig.announcement} />
          </div>
        )}
        {serverConfig.links && serverConfig.links.length > 0 && (
          <div className="mb-6">
            <SocialLinks links={serverConfig.links} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="mb-6 space-y-4">
          {serverConfig.announcement && (
            <GlassPanel className="border-white/10 p-4">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">Info</h2>
              <p className="text-sm font-medium text-white/90">{serverConfig.announcement}</p>
            </GlassPanel>
          )}
          {settingsEntries.length > 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {settingsEntries.map((s) => (
                <StatCard key={s.label} label={s.label} value={s.value} color="cyan" />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Activity Graph */}
          {isInfluxEnabled() && (
            <GlassPanel neon="purple" className="border-white/10 p-6">
              <HistoryChart serverId={serverConfig.id} />
            </GlassPanel>
          )}

          {/* World Map */}
          {mapConfig && (
            <GlassPanel neon="cyan" className="border-white/10 p-6">
              <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-white/80">World Map</h2>
              <div className="overflow-hidden rounded-lg border border-white/10">
                <GameMapWrapper serverId={serverConfig.id} mapConfig={mapConfig} />
              </div>
              {/* Blip Legend */}
              <div className="mt-4 flex flex-wrap gap-3 text-[10px] font-bold text-white/60">
                {[
                  { color: "#f97316", label: "Player" },
                  { color: "#3b82f6", label: "Police" },
                  { color: "#ef4444", label: "Hospital" },
                  { color: "#eab308", label: "Shop" },
                  { color: "#f97316", label: "Garage" },
                  { color: "#a855f7", label: "Services" },
                  { color: "#06b6d4", label: "ATM" },
                ].map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
                    {item.label}
                  </span>
                ))}
              </div>
            </GlassPanel>
          )}

          {/* Resources + Players */}
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Resource List */}
            {mods && mods.length > 0 && (
              <GlassPanel neon="purple" className="flex-1 border-white/10 p-6">
                <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-white/80">
                  Server Resources ({mods.length})
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mods.map((mod) => {
                    const isQbox = mod.name.startsWith("qbox") || mod.name.startsWith("qbx");
                    return (
                      <div
                        key={mod.name}
                        className={`cursor-default rounded border px-2 py-1 text-[10px] font-bold transition-all hover:scale-105 ${
                          isQbox
                            ? "border-cyan-500/30 text-cyan-400/80 hover:border-cyan-500/50 hover:text-cyan-400"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                        }`}
                      >
                        {mod.name}
                      </div>
                    );
                  })}
                </div>
              </GlassPanel>
            )}

            {/* Player List */}
            <GlassPanel neon="purple" className="flex-1 border-white/10 p-6">
              <h2 className="mb-6 text-sm font-black uppercase tracking-widest text-white/80">
                Player List
              </h2>
              <div className="w-full overflow-hidden rounded-lg border border-white/5">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3 text-right">Ping</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-12">
                          <div className="flex flex-col items-center justify-center gap-3 text-white/20">
                            <UserX size={32} />
                            <span className="text-xs font-bold uppercase tracking-widest">
                              No players currently online
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      players.map((p) => (
                        <tr key={p.id} className="border-t border-white/5 transition-colors hover:bg-white/5">
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="font-medium">{p.name}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-white/40">{p.id}</td>
                          <td className="px-4 py-3 text-right font-mono text-xs text-white/40">{p.ping ?? "—"}ms</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/5 py-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
            FiveM Server Dashboard | Powered by {framework || "QBox"} Framework
          </p>
        </footer>
      </div>
    </div>
  );
}

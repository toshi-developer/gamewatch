import Link from "next/link";
import { Skull, Activity, Crosshair, CheckCircle2 } from "lucide-react";
import type { ServerStatus, Player, ModEntry, MapConfig, ServerSetting } from "@/lib/providers/types";
import type { ServerConfig } from "@/lib/config.schema";
import { t } from "@/lib/i18n";
import { AutoRefresh } from "@/components/shared/auto-refresh";
import { GameMapWrapper } from "@/components/shared/game-map/map-wrapper";
import { HistoryChart } from "@/components/shared/history-chart";
import { Announcement } from "@/components/shared/announcement";
import { SocialLinks } from "@/components/shared/social-links";
import { Ranking } from "@/components/shared/ranking";
import { isInfluxEnabled } from "@/lib/influx";

const Rivet = () => <div className="rivet" />;

function Panel({
  children,
  className = "",
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={`grunge-panel ${className}`}>
      {title && <div className="grunge-header">{title}</div>}
      <div className="relative p-4">
        <div className="absolute left-1 top-1"><Rivet /></div>
        <div className="absolute right-1 top-1"><Rivet /></div>
        <div className="absolute bottom-1 left-1"><Rivet /></div>
        <div className="absolute bottom-1 right-1"><Rivet /></div>
        {children}
      </div>
    </div>
  );
}

export function SdtdDashboard({
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
  const gametime = status.gameSpecific.gametime as { days: number; hours: number; minutes: number } | undefined;
  const bloodMoonIn = Number(status.gameSpecific.bloodMoonIn ?? -1);
  const frequency = Number(status.gameSpecific.bloodMoonFrequency ?? 7);
  const onlinePlayers = players.filter((p) => p.online);

  const totalKills = onlinePlayers.reduce((s, p) => s + Number(p.gameSpecific.zombiekills ?? 0), 0);
  const totalDeaths = onlinePlayers.reduce((s, p) => s + Number(p.gameSpecific.playerdeaths ?? 0), 0);
  const kd = totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(1) : "—";

  const bmProgress = frequency > 0 && bloodMoonIn >= 0
    ? ((frequency - bloodMoonIn) / frequency) * 100
    : 0;
  const timeStr = gametime
    ? `${String(gametime.hours).padStart(2, "0")}:${String(gametime.minutes).padStart(2, "0")}`
    : "";
  const isNight = gametime ? (gametime.hours >= 22 || gametime.hours < 4) : false;

  return (
    <div className="theme-sdtd min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Nav */}
        <nav className="flex items-center gap-3 text-xs text-zinc-500">
          <Link href="/" className="hover:text-zinc-300">{t("home.title")}</Link>
          <span>/</span>
          <span className="text-zinc-300">{serverConfig.label}</span>
          <div className="ml-auto flex items-center gap-2">
            <AutoRefresh serverId={serverConfig.id} />
            <Link
              href={`/servers/${serverConfig.id}/admin`}
              className="rounded-sm border border-zinc-700 px-2 py-1 text-[10px] text-zinc-500 hover:text-zinc-300"
            >
              Admin
            </Link>
          </div>
        </nav>

        {/* Announcement */}
        {serverConfig.announcement && <Announcement text={serverConfig.announcement} />}
        {serverConfig.links && serverConfig.links.length > 0 && <SocialLinks links={serverConfig.links} />}

        {/* Header */}
        <Panel className="border-zinc-700 bg-zinc-900/90">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-center md:text-left">
              <h1 className="grunge-title">7 Days to Die</h1>
              <div className="mt-1 flex items-center gap-4">
                <span className={`flex items-center gap-1 text-sm font-bold ${isLive ? "text-green-500" : "text-red-500"}`}>
                  <div className={`h-2 w-2 rounded-full ${isLive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                  {isLive ? "LIVE" : "OFFLINE"}
                </span>
                {gametime && (
                  <span className={`font-mono text-lg uppercase ${isNight ? "text-blue-400" : "text-zinc-400"}`}>
                    Day {gametime.days} - {timeStr}
                  </span>
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Players</div>
              <div className="text-2xl font-black text-zinc-300">
                <span className="text-red-600">{status.playerCount}</span> / {status.maxPlayers}
              </div>
            </div>
          </div>
        </Panel>

        {/* Blood Moon & Clock */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Panel className="flex flex-col justify-center md:col-span-2">
            <div className="mb-4 text-center">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-700">
                Blood Moon
              </h2>
            </div>
            <div className="blood-moon-bar">
              <div className="blood-moon-progress" style={{ width: `${bmProgress}%` }} />
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.2em] text-white drop-shadow-md">
                {bloodMoonIn === 0 ? "TONIGHT!" : `${bloodMoonIn} Days Remaining`}
              </div>
            </div>
            <div className="mt-2 flex justify-between px-1">
              <Skull size={16} className="text-red-900 opacity-50" />
              <div className="flex gap-2">
                <Skull size={12} className="text-zinc-700" />
                <Skull size={12} className="text-zinc-700" />
              </div>
            </div>
          </Panel>

          <Panel className="flex items-center justify-center bg-zinc-900/40">
            <DayNightClock time={timeStr || "12:00"} />
          </Panel>
        </div>

        {/* Stats Bar */}
        <Panel className="bg-zinc-950/50 py-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Skull size={14} className="text-zinc-500" />
              <span className="text-xs font-bold uppercase text-zinc-500">Zombie Kills:</span>
              <span className="text-sm font-black text-red-800">{totalKills.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-center gap-2 border-x border-zinc-800">
              <Activity size={14} className="text-zinc-500" />
              <span className="text-xs font-bold uppercase text-zinc-500">Deaths:</span>
              <span className="text-sm font-black text-red-800">{totalDeaths.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Crosshair size={14} className="text-zinc-500" />
              <span className="text-xs font-bold uppercase text-zinc-500">K/D:</span>
              <span className="text-sm font-black text-green-700">{kd}</span>
            </div>
          </div>
        </Panel>

        {/* Map */}
        {mapConfig && (
          <Panel className="overflow-hidden border-zinc-800 p-0">
            <div className="p-0">
              <GameMapWrapper serverId={serverConfig.id} mapConfig={mapConfig} />
            </div>
          </Panel>
        )}

        {/* History */}
        {isInfluxEnabled() && <HistoryChart serverId={serverConfig.id} />}

        {/* Bottom panels */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Server Settings */}
          {settings && Object.keys(settings).length > 0 && (
            <Panel title="Server Settings" className="bg-zinc-900/60">
              <div className="space-y-3">
                {Object.values(settings).map((s) => (
                  <div key={s.label}>
                    <label className="mb-1 block text-[10px] font-bold uppercase text-zinc-500">{s.label}</label>
                    <div className="flex items-center justify-between rounded-sm border border-zinc-800 bg-zinc-950 px-2 py-1">
                      <span className="text-xs font-bold uppercase text-zinc-300">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Mod List */}
          {mods && mods.length > 0 && (
            <Panel title={`Mod List (${mods.length})`} className="bg-zinc-900/60">
              <div className="custom-scrollbar max-h-[220px] space-y-2 overflow-y-auto pr-2">
                {mods.map((mod) => (
                  <div key={mod.name} className="flex items-center gap-2 text-[10px] font-medium text-zinc-400">
                    <CheckCircle2 size={12} className="shrink-0 text-orange-700" />
                    <span className="truncate">{mod.name}</span>
                    {mod.version && <span className="ml-auto shrink-0 text-zinc-600">{mod.version}</span>}
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {/* Rankings */}
          {players.length > 0 && (
            <Panel title="Rankings" className="bg-zinc-900/60">
              <Ranking players={players} game="sdtd" />
            </Panel>
          )}
        </div>

        {/* Player List */}
        {players.length > 0 && (
          <Panel title={`Players (${onlinePlayers.length} online / ${players.length} total)`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4 text-right">Level</th>
                    <th className="pb-2 pr-4 text-right">Kills</th>
                    <th className="pb-2 text-right">Deaths</th>
                  </tr>
                </thead>
                <tbody>
                  {onlinePlayers.sort((a, b) => Number(b.gameSpecific.level ?? 0) - Number(a.gameSpecific.level ?? 0)).map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800/50 last:border-0">
                      <td className="py-2 pr-4">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-green-500">ON</span>
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-medium">{p.name}</td>
                      <td className="py-2 pr-4 text-right font-mono text-orange-600">{Number(p.gameSpecific.level ?? 0)}</td>
                      <td className="py-2 pr-4 text-right font-mono">{Number(p.gameSpecific.zombiekills ?? 0).toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-red-600">{Number(p.gameSpecific.playerdeaths ?? 0)}</td>
                    </tr>
                  ))}
                  {players.filter((p) => !p.online).map((p) => (
                    <tr key={p.id} className="border-b border-zinc-800/50 opacity-40 last:border-0">
                      <td className="py-2 pr-4">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-zinc-600" />
                          <span className="text-[10px] font-bold text-zinc-600">OFF</span>
                        </span>
                      </td>
                      <td className="py-2 pr-4 font-medium text-zinc-500">{p.name}</td>
                      <td className="py-2 pr-4 text-right text-zinc-600">—</td>
                      <td className="py-2 pr-4 text-right text-zinc-600">—</td>
                      <td className="py-2 text-right text-zinc-600">—</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}

/* Day/Night Clock component */
function DayNightClock({ time }: { time: string }) {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const rotation = (totalMinutes / (24 * 60)) * 360 - 90;
  const isNight = hours >= 22 || hours < 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-800 bg-zinc-950 shadow-inner">
        {/* Day half */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-amber-200/20 to-transparent"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }}
        />
        {/* Night half */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent"
          style={{ clipPath: "polygon(0 50%, 100% 50%, 100% 100%, 0 100%)" }}
        />
        {/* Clock numbers */}
        {[0, 6, 12, 18].map((n) => (
          <div
            key={n}
            className="absolute text-[8px] font-bold text-zinc-600"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${n * 15 - 90}deg) translate(50px) rotate(${-(n * 15 - 90)}deg) translate(-50%, -50%)`,
            }}
          >
            {n}
          </div>
        ))}
        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="z-10 h-1 w-1 rounded-full bg-zinc-600" />
        </div>
        {/* Hand */}
        <div
          className="absolute left-1/2 top-1/2 h-0.5 w-1/2 origin-left bg-zinc-400"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        {/* Sun/Moon icons */}
        <div className="absolute left-1/2 top-4 -translate-x-1/2 text-xs text-amber-500 opacity-40">
          {isNight ? "" : "\u2600"}
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-blue-400 opacity-40">
          {isNight ? "\u{1F319}" : ""}
        </div>
      </div>
      <div className="flex w-full justify-between text-[10px] font-bold uppercase text-zinc-500">
        <span>{isNight ? "\u{1F319}" : "\u2600"} {time}</span>
        <span>{isNight ? "Night" : "Day"}</span>
      </div>
    </div>
  );
}

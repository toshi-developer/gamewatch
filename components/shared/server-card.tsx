import Link from "next/link";
import type { ServerStatus } from "@/lib/providers/types";
import type { ServerConfig } from "@/lib/config.schema";
import { Card } from "./card";

const GAME_LABELS: Record<string, string> = {
  sdtd: "7 Days to Die",
  fivem: "FiveM",
  minecraft: "Minecraft",
  palworld: "Palworld",
  rust: "Rust",
  ark: "ARK",
};

export function ServerCard({
  config,
  status,
}: {
  config: ServerConfig;
  status: ServerStatus | null;
}) {
  const isOnline = status?.online ?? false;

  return (
    <Link href={`/servers/${config.id}`} className="block">
      <Card className="transition-colors hover:border-accent/50">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-3 w-3 rounded-full ${
              isOnline ? "bg-green animate-pulse-dot" : "bg-muted"
            }`}
          />
          <div className="flex-1">
            <h2 className="font-semibold">{config.label}</h2>
            <p className="text-xs text-muted">
              {GAME_LABELS[config.game] ?? config.game}
            </p>
          </div>
          {status && (
            <div className="text-right">
              <span className="text-lg font-bold tabular-nums text-accent">
                {status.playerCount}
              </span>
              <span className="text-sm text-muted">
                /{status.maxPlayers}
              </span>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}

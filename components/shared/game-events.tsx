import type { GameEvent } from "@/lib/providers/types";
import { t } from "@/lib/i18n";
import { Card } from "./card";

const COLOR_MAP: Record<string, string> = {
  red: "text-red",
  yellow: "text-yellow",
  green: "text-green",
  accent: "text-accent",
};

export function GameEvents({ events }: { events: GameEvent[] }) {
  if (events.length === 0) return null;

  return (
    <Card title={t("events.title")}>
      <div className="flex flex-wrap gap-5">
        {events.map((e) => (
          <div key={e.type} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted">{e.label}</span>
            <span
              className={`text-lg font-bold tabular-nums ${
                e.color ? COLOR_MAP[e.color] ?? "" : ""
              }`}
            >
              {e.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

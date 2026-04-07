import type { ServerStatus } from "@/lib/providers/types";

export function DayNightIndicator({ status }: { status: ServerStatus }) {
  const gametime = status.gameSpecific.gametime as
    | { days: number; hours: number; minutes: number }
    | undefined;
  if (!gametime) return null;

  const { days, hours, minutes } = gametime;
  const isNight = hours >= 22 || hours < 4;
  const isDusk = hours >= 20 && hours < 22;
  const isDawn = hours >= 4 && hours < 6;

  // 24h progress (0-100%)
  const dayProgress = ((hours * 60 + minutes) / 1440) * 100;

  // Night zone: 22:00-04:00 (displayed as darker region)
  const nightStart = (22 / 24) * 100;
  const nightEnd = (4 / 24) * 100;

  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

  let phaseLabel: string;
  let phaseIcon: string;
  let phaseColor: string;
  if (isNight) {
    phaseLabel = "Night";
    phaseIcon = "\u{1F319}"; // crescent moon
    phaseColor = "text-yellow";
  } else if (isDusk) {
    phaseLabel = "Dusk";
    phaseIcon = "\u{1F307}"; // sunset
    phaseColor = "text-yellow";
  } else if (isDawn) {
    phaseLabel = "Dawn";
    phaseIcon = "\u{1F305}"; // sunrise
    phaseColor = "text-accent";
  } else {
    phaseLabel = "Day";
    phaseIcon = "\u{2600}\u{FE0F}"; // sun
    phaseColor = "text-foreground";
  }

  return (
    <div className="rounded-xl border border-card-border bg-card px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm">
          <span className="mr-1.5">{phaseIcon}</span>
          <span className="font-semibold">Day {days}</span>
          <span className={`ml-2 ${phaseColor}`}>
            {timeStr}
          </span>
          <span className="ml-2 text-xs text-muted">{phaseLabel}</span>
        </span>
      </div>
      {/* Day/night timeline bar */}
      <div className="relative h-2 overflow-hidden rounded-full bg-card-border">
        {/* Night zone background (22:00-04:00) */}
        <div
          className="absolute h-full bg-muted/30"
          style={{ left: `${nightStart}%`, width: `${100 - nightStart}%` }}
        />
        <div
          className="absolute h-full bg-muted/30"
          style={{ left: 0, width: `${nightEnd}%` }}
        />
        {/* Current time marker */}
        <div
          className={`absolute top-0 h-full w-1 rounded-full ${
            isNight ? "bg-yellow" : "bg-accent"
          }`}
          style={{ left: `${dayProgress}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-muted">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

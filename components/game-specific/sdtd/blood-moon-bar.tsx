import type { ServerStatus } from "@/lib/providers/types";

export function BloodMoonBar({ status }: { status: ServerStatus }) {
  const bloodMoonIn = Number(status.gameSpecific.bloodMoonIn ?? -1);
  const frequency = Number(status.gameSpecific.bloodMoonFrequency ?? 7);
  if (bloodMoonIn < 0 || frequency <= 0) return null;

  const progress = ((frequency - bloodMoonIn) / frequency) * 100;
  const isTonight = bloodMoonIn === 0;
  const isSoon = bloodMoonIn <= 1;

  return (
    <div className="rounded-xl border border-card-border bg-card px-5 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold">
          {isTonight ? (
            <span className="text-red animate-pulse">Blood Moon TONIGHT</span>
          ) : (
            <>
              Blood Moon in{" "}
              <span className={isSoon ? "text-red" : "text-accent"}>
                {bloodMoonIn} {bloodMoonIn === 1 ? "day" : "days"}
              </span>
            </>
          )}
        </span>
        <span className="text-xs text-muted">
          Every {frequency} days
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-card-border">
        <div
          className={`h-full rounded-full transition-all ${
            isTonight
              ? "bg-red animate-pulse"
              : isSoon
                ? "bg-red"
                : "bg-accent"
          }`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

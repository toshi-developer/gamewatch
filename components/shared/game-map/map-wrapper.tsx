"use client";

import dynamic from "next/dynamic";
import type { MapConfig } from "@/lib/providers/types";

const MapView = dynamic(
  () => import("./map-view").then((m) => m.MapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-80 items-center justify-center rounded-xl border border-card-border bg-card sm:h-[28rem]">
        <p className="text-sm text-muted">Loading map...</p>
      </div>
    ),
  },
);

export function GameMapWrapper({
  serverId,
  mapConfig,
}: {
  serverId: string;
  mapConfig: MapConfig;
}) {
  return <MapView serverId={serverId} mapConfig={mapConfig} />;
}

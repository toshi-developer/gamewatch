"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({
  serverId,
  intervalSec = 30,
}: {
  serverId?: string;
  intervalSec?: number;
}) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(intervalSec);
  const startedAt = useRef(Date.now());

  useEffect(() => {
    startedAt.current = Date.now();

    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      const left = intervalSec - (elapsed % intervalSec);
      setRemaining(left);

      if (elapsed > 0 && elapsed % intervalSec === 0) {
        router.refresh();
      }
    }, 1000);

    return () => clearInterval(tick);
  }, [router, intervalSec]);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green animate-pulse-dot" />
      <span>{remaining}s</span>
    </div>
  );
}

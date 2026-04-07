"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Gamewatch]", error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-6xl font-bold tabular-nums text-red">500</span>
      <h1 className="mt-4 text-xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-sm text-muted">
        An unexpected error occurred. This may be a temporary issue with the
        game server connection.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-card-border px-5 py-2 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
        >
          Back to Home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-4 font-mono text-xs text-muted">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}

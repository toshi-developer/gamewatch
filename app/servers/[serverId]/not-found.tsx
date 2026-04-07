import Link from "next/link";

export default function ServerNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <span className="text-6xl font-bold tabular-nums text-accent">404</span>
      <h1 className="mt-4 text-xl font-bold">Server Not Found</h1>
      <p className="mt-2 text-sm text-muted">
        This server ID is not configured in gamewatch.yaml.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Server List
      </Link>
    </div>
  );
}

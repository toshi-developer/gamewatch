import Link from "next/link";
import { getConfig } from "@/lib/config";
import { getProvider } from "@/lib/registry";
import { t } from "@/lib/i18n";
import { ServerCard } from "@/components/shared/server-card";
import type { ServerStatus } from "@/lib/providers/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { site, servers } = getConfig();

  // Fetch status for all servers in parallel
  const statuses = await Promise.all(
    servers.map(async (s) => {
      try {
        const provider = getProvider(s.id);
        return await provider.getStatus();
      } catch {
        return null;
      }
    }),
  );

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{site.name}</h1>
          <p className="mt-1 text-sm text-muted">{t("home.title")}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/help"
            className="rounded-lg border border-card-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            Help
          </Link>
          <Link
            href="/admin"
            className="rounded-lg border border-card-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-accent"
          >
            Admin
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {servers.map((s, i) => (
          <ServerCard key={s.id} config={s} status={statuses[i]} />
        ))}
      </div>
    </div>
  );
}

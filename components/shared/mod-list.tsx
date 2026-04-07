import type { ModEntry } from "@/lib/providers/types";
import type { GameType } from "@/lib/config.schema";
import { t } from "@/lib/i18n";
import { Card } from "./card";

export function ModList({ mods, game }: { mods: ModEntry[]; game: GameType }) {
  const title =
    game === "fivem"
      ? `${t("mods.resources")}（${t("mods.count", { n: mods.length })}）`
      : `${t("mods.title")}（${t("mods.count", { n: mods.length })}）`;

  if (mods.length === 0) {
    return (
      <Card title={title}>
        <p className="py-8 text-center text-sm text-muted">{t("mods.none")}</p>
      </Card>
    );
  }

  // Group by category if available
  const hasCategories = mods.some((m) => m.category);

  if (hasCategories) {
    const groups = new Map<string, ModEntry[]>();
    for (const mod of mods) {
      const cat = mod.category ?? "Other";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(mod);
    }

    return (
      <Card title={title}>
        <div className="flex flex-col gap-4">
          {[...groups.entries()].map(([cat, items]) => (
            <div key={cat}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                {cat}
              </h3>
              <div className="flex flex-wrap gap-2">
                {items.map((m) => (
                  <ModBadge key={m.name} mod={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title={title}>
      <div className="flex flex-wrap gap-2">
        {mods.map((m) => (
          <ModBadge key={m.name} mod={m} />
        ))}
      </div>
    </Card>
  );
}

function ModBadge({ mod }: { mod: ModEntry }) {
  return (
    <span className="rounded-md border border-card-border bg-background px-2.5 py-1 text-xs">
      {mod.name}
      {mod.version && (
        <span className="ml-1 text-muted">{mod.version}</span>
      )}
    </span>
  );
}

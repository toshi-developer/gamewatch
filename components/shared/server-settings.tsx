import type { ServerSetting } from "@/lib/providers/types";
import { t } from "@/lib/i18n";
import { Card } from "./card";

export function ServerSettings({
  settings,
}: {
  settings: Record<string, ServerSetting>;
}) {
  const entries = Object.values(settings);
  if (entries.length === 0) return null;

  return (
    <Card title={t("server.settings")}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        {entries.map((s) => (
          <div key={s.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-muted">{s.label}</span>
            <span className="text-sm font-medium">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

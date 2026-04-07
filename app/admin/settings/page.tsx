"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ServerEntry {
  id: string;
  game: string;
  label: string;
  apiUrl: string;
  auth?: { tokenName?: string; tokenSecret?: string; rconPassword?: string };
  resourceName?: string;
}

interface SiteConfig {
  name: string;
  locale: string;
  refreshInterval: number;
  footer: {
    text: string;
    link: { label: string; url: string };
  };
}

interface Config {
  site: SiteConfig;
  servers: ServerEntry[];
}

const GAME_OPTIONS = [
  { value: "sdtd", label: "7 Days to Die" },
  { value: "fivem", label: "FiveM" },
  { value: "minecraft", label: "Minecraft" },
  { value: "palworld", label: "Palworld" },
  { value: "rust", label: "Rust" },
  { value: "ark", label: "ARK" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [config, setConfig] = useState<Config | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editingServer, setEditingServer] = useState<number | "new" | null>(null);

  const fetchConfig = useCallback(async () => {
    const res = await fetch("/api/admin/config");
    if (res.status === 401) {
      router.push("/admin");
      return;
    }
    if (!res.ok) {
      setError("Failed to load config");
      return;
    }
    setConfig(await res.json());
  }, [router]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const res = await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (res.status === 401) {
        router.push("/admin");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Connection error");
    } finally {
      setSaving(false);
    }
  };

  const updateSite = (key: keyof SiteConfig, value: string | number) => {
    if (!config) return;
    setConfig({ ...config, site: { ...config.site, [key]: value } });
  };

  const updateFooter = (key: string, value: string) => {
    if (!config) return;
    if (key === "text") {
      setConfig({
        ...config,
        site: { ...config.site, footer: { ...config.site.footer, text: value } },
      });
    } else if (key === "linkLabel") {
      setConfig({
        ...config,
        site: {
          ...config.site,
          footer: {
            ...config.site.footer,
            link: { ...config.site.footer.link, label: value },
          },
        },
      });
    } else if (key === "linkUrl") {
      setConfig({
        ...config,
        site: {
          ...config.site,
          footer: {
            ...config.site.footer,
            link: { ...config.site.footer.link, url: value },
          },
        },
      });
    }
  };

  const updateServer = (index: number, updates: Partial<ServerEntry>) => {
    if (!config) return;
    const servers = [...config.servers];
    servers[index] = { ...servers[index], ...updates };
    setConfig({ ...config, servers });
  };

  const addServer = () => {
    if (!config) return;
    const newId = `server-${Date.now()}`;
    setConfig({
      ...config,
      servers: [
        ...config.servers,
        { id: newId, game: "sdtd", label: "New Server", apiUrl: "http://localhost:8081" },
      ],
    });
    setEditingServer(config.servers.length);
  };

  const removeServer = (index: number) => {
    if (!config) return;
    const servers = config.servers.filter((_, i) => i !== index);
    setConfig({ ...config, servers });
    setEditingServer(null);
  };

  if (!config) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center px-4 py-8">
        <p className="text-sm text-muted">{error || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 px-4 py-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted">gamewatch.yaml</p>
        </div>
        <Link href="/" className="text-sm text-accent hover:underline">
          Dashboard
        </Link>
      </header>

      {/* Site Settings */}
      <Section title="Site">
        <Field label="Site Name" value={config.site.name} onChange={(v) => updateSite("name", v)} />
        <Field
          label="Locale"
          value={config.site.locale}
          onChange={(v) => updateSite("locale", v)}
          type="select"
          options={[
            { value: "ja", label: "Japanese" },
            { value: "en", label: "English" },
          ]}
        />
        <Field
          label="Refresh Interval (sec)"
          value={String(config.site.refreshInterval)}
          onChange={(v) => updateSite("refreshInterval", Number(v) || 30)}
          type="number"
        />
        <Field label="Footer Text" value={config.site.footer.text} onChange={(v) => updateFooter("text", v)} />
        <Field label="Footer Link Label" value={config.site.footer.link.label} onChange={(v) => updateFooter("linkLabel", v)} />
        <Field label="Footer Link URL" value={config.site.footer.link.url} onChange={(v) => updateFooter("linkUrl", v)} />
      </Section>

      {/* Servers */}
      <Section title="Servers">
        <div className="flex flex-col gap-3">
          {config.servers.map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-card-border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="rounded bg-card px-2 py-0.5 text-xs text-muted">
                    {s.game}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingServer(editingServer === i ? null : i)}
                    className="text-xs text-accent hover:underline"
                  >
                    {editingServer === i ? "Close" : "Edit"}
                  </button>
                  <button
                    onClick={() => removeServer(i)}
                    className="text-xs text-red hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {editingServer === i && (
                <div className="mt-3 flex flex-col gap-2 border-t border-card-border pt-3">
                  <Field label="ID" value={s.id} onChange={(v) => updateServer(i, { id: v })} />
                  <Field
                    label="Game"
                    value={s.game}
                    onChange={(v) => updateServer(i, { game: v })}
                    type="select"
                    options={GAME_OPTIONS}
                  />
                  <Field label="Label" value={s.label} onChange={(v) => updateServer(i, { label: v })} />
                  <Field label="API URL" value={s.apiUrl} onChange={(v) => updateServer(i, { apiUrl: v })} />
                  {s.game === "sdtd" && (
                    <>
                      <Field
                        label="Token Name"
                        value={s.auth?.tokenName ?? ""}
                        onChange={(v) => updateServer(i, { auth: { ...s.auth, tokenName: v } })}
                      />
                      <Field
                        label="Token Secret"
                        value={s.auth?.tokenSecret ?? ""}
                        onChange={(v) => updateServer(i, { auth: { ...s.auth, tokenSecret: v } })}
                        type="password"
                      />
                    </>
                  )}
                  {s.game === "fivem" && (
                    <Field
                      label="Resource Name"
                      value={s.resourceName ?? "gamewatch_api"}
                      onChange={(v) => updateServer(i, { resourceName: v })}
                    />
                  )}
                  {(s.game === "minecraft" || s.game === "rust") && (
                    <Field
                      label="RCON Password"
                      value={s.auth?.rconPassword ?? ""}
                      onChange={(v) => updateServer(i, { auth: { ...s.auth, rconPassword: v } })}
                      type="password"
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={addServer}
          className="mt-2 w-full rounded-lg border border-dashed border-card-border py-2 text-sm text-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Add Server
        </button>
      </Section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        {saved && (
          <span className="text-sm text-green">Saved. Restart the container to apply changes.</span>
        )}
        {error && <span className="text-sm text-red">{error}</span>}
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: "text" | "password" | "number" | "select";
  options?: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <label className="w-40 shrink-0 text-xs text-muted">{label}</label>
      {type === "select" && options ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-card-border bg-background px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
        />
      )}
    </div>
  );
}

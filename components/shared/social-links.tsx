const ICONS: Record<string, string> = {
  discord: "Discord",
  twitter: "X / Twitter",
  youtube: "YouTube",
  twitch: "Twitch",
  website: "Website",
  github: "GitHub",
};

const COLORS: Record<string, string> = {
  discord: "#5865F2",
  twitter: "#1DA1F2",
  youtube: "#FF0000",
  twitch: "#9146FF",
  website: "#f97316",
  github: "#e2e8f0",
};

interface SocialLink {
  type: string;
  url: string;
  label?: string;
}

export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-card-border px-3 py-1.5 text-xs transition-colors hover:border-accent/50"
        >
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: COLORS[link.type] ?? "#64748b" }}
          />
          {link.label ?? ICONS[link.type] ?? link.type}
        </a>
      ))}
    </div>
  );
}

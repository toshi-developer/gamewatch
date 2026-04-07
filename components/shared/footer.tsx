import { getConfig } from "@/lib/config";

export function Footer() {
  const { site } = getConfig();
  const { footer } = site;

  return (
    <footer className="mt-auto border-t border-card-border pt-4 text-center text-xs text-muted">
      {footer.text}{" "}
      <a
        href={footer.link.url}
        className="text-accent hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {footer.link.label}
      </a>
    </footer>
  );
}

export function Announcement({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="rounded-xl border border-accent/30 bg-accent/10 px-5 py-3 text-sm">
      <span className="mr-2 text-accent">INFO</span>
      {text}
    </div>
  );
}

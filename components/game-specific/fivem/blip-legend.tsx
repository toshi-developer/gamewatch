const LEGEND_ITEMS = [
  { color: "#f97316", label: "Player" },
  { color: "#3b82f6", label: "Police" },
  { color: "#ef4444", label: "Hospital" },
  { color: "#22c55e", label: "Shop" },
  { color: "#eab308", label: "Gas" },
  { color: "#a855f7", label: "Garage" },
  { color: "#ec4899", label: "Services" },
  { color: "#06b6d4", label: "ATM" },
  { color: "#f59e0b", label: "Food" },
  { color: "#6b7280", label: "Other" },
];

export function BlipLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-card-border bg-card px-5 py-3 text-xs text-muted">
      {LEGEND_ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

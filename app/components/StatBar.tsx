// [REFACTOR v0.2.0]: Horizontal stat bar component — design system Integra Mutual

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
  suffix?: string;
}

export default function StatBar({
  label,
  value,
  max,
  color,
  suffix,
}: StatBarProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const barColor = color || "var(--accent-green)";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-white/80">{label}</span>
        <span className="font-semibold text-white">
          {value}
          {suffix ? ` ${suffix}` : ""}
        </span>
      </div>
      <div
        className="h-2 w-full rounded-full"
        style={{ background: "var(--bg-overlay)" }}
      >
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
}

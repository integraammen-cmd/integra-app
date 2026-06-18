// [FEATURE v0.3.0]: StatLineChart — gráfico de línea SVG puro
"use client";

interface StatLineChartProps {
  datos: { label: string; valor: number }[];
  color?: string;
  height?: number;
}

export default function StatLineChart({ datos, color, height = 200 }: StatLineChartProps) {
  if (datos.length < 2) {
    return (
      <div className="flex items-center justify-center text-sm" style={{ height, color: "var(--text-muted)" }}>
        Datos insuficientes para el gráfico
      </div>
    );
  }

  const lineColor = color || "var(--accent-green)";
  const maxVal = Math.max(...datos.map((d) => d.valor), 1);
  const padding = { top: 20, right: 16, bottom: 28, left: 8 };
  const w = 320;
  const h = height;
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const points = datos.map((d, i) => {
    const x = padding.left + (i / (datos.length - 1)) * chartW;
    const y = padding.top + chartH - (d.valor / maxVal) * chartH;
    return { x, y, ...d };
  });

  // SVG path suavizado (bezier simple)
  const pathD = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const cx1 = prev.x + (p.x - prev.x) / 3;
      const cx2 = prev.x + (2 * (p.x - prev.x)) / 3;
      return `C ${cx1} ${prev.y}, ${cx2} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  // Ticks eje Y
  const yTicks = [0, Math.round(maxVal / 2), maxVal];

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="mx-auto">
        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = padding.top + chartH - (tick / maxVal) * chartH;
          return (
            <g key={tick}>
              <line x1={padding.left} y1={y} x2={w - padding.right} y2={y} stroke="var(--border)" strokeWidth="0.5" />
              <text x={padding.left - 4} y={y + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">
                {tick}
              </text>
            </g>
          );
        })}

        {/* Line */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2" strokeOpacity="0.6" />

        {/* Points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill={lineColor} />
            <title>{`${p.label}: ${p.valor}`}</title>
            <text x={p.x} y={h - 2} textAnchor="middle" fontSize="8" fill="var(--text-muted)">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

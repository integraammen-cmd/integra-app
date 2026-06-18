// [FEATURE v0.3.0]: CrossTable — tabla cruzada con diseño del design system
"use client";

interface CrossTableProps {
  filas: string[];
  columnas: string[];
  datos: Record<string, Record<string, number>>;
  destacarMax?: boolean;
  labelFilas?: string;
}

export default function CrossTable({
  filas,
  columnas,
  datos,
  destacarMax = true,
  labelFilas = "Tipo de socio",
}: CrossTableProps) {
  // Encontrar máximos por fila
  const maxPorFila: Record<string, number> = {};
  if (destacarMax) {
    filas.forEach((fila) => {
      let max = 0;
      columnas.forEach((col) => {
        const v = datos[fila]?.[col] ?? 0;
        if (v > max) max = v;
      });
      maxPorFila[fila] = max;
    });
  }

  return (
    <div className="overflow-x-auto">
      <div className="block sm:hidden px-1 py-1.5 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
        ← deslizá →
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            <th
              className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--accent-green)" }}
            >
              {labelFilas}
            </th>
            {columnas.map((col) => (
              <th
                key={col}
                className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--accent-green)" }}
              >
                {col.length > 15 ? col.slice(0, 15) + "…" : col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, fi) => (
            <tr
              key={fila}
              style={{
                borderBottom: "1px solid var(--border)",
                background: fi % 2 === 0 ? "var(--bg-overlay)" : "transparent",
              }}
            >
              <td className="px-3 py-2 font-medium text-white text-xs">{fila}</td>
              {columnas.map((col) => {
                const val = datos[fila]?.[col] ?? 0;
                const isMax = destacarMax && maxPorFila[fila] > 0 && val === maxPorFila[fila];
                return (
                  <td
                    key={col}
                    className="px-3 py-2 text-right tabular-nums text-xs"
                    style={{
                      color: isMax ? "var(--accent-green)" : val === 0 ? "var(--text-muted)" : "var(--text-primary)",
                      fontWeight: isMax ? 600 : 400,
                    }}
                  >
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

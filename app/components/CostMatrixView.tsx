// [REFACTOR v0.2.0]: CostMatrixView redesign — Integra Mutual brand identity
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import PdfShareButton from "./PdfShareButton";

type MatrixRow = {
  id: string;
  name: string;
  group_name: string;
  activo: number | null;
  integra_90: number | null;
  integra_180: number | null;
  integra_360: number | null;
  integra_360_plus: number | null;
};

const PARTNER_HEADERS = [
  { key: "activo", label: "Activo", desc: "60% desc." },
  { key: "integra_90", label: "Integra 90", desc: "Precio base" },
  { key: "integra_180", label: "Integra 180", desc: "30% desc." },
  { key: "integra_360", label: "Integra 360", desc: "40% desc." },
  { key: "integra_360_plus", label: "360 Plus", desc: "A confirmar" },
] as const;

// [FEATURE v0.3.0]: soporta prop embedded para modo tab
export default function CostMatrixView({ embedded }: { embedded?: boolean }) {
  const [rows, setRows] = useState<MatrixRow[]>([]);
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("todas");
  const [loading, setLoading] = useState(true);

  const loadMatrix = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/matrix");
    if (res.ok) setRows(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { loadMatrix(); }, [loadMatrix]);

  const groups = useMemo(
    () => ["todas", ...new Set(rows.map((r) => r.group_name).filter(Boolean))],
    [rows]
  );

  const filtered = useMemo(() => {
    let result = rows;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(s));
    }
    if (groupFilter !== "todas") {
      result = result.filter((r) => r.group_name === groupFilter);
    }
    const grouped: Record<string, MatrixRow[]> = {};
    result.forEach((r) => {
      const g = r.group_name || "Sin grupo";
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(r);
    });
    return grouped;
  }, [rows, search, groupFilter]);

  function formatPrice(val: number | null): string {
    if (val == null) return "—";
    return `$${val.toFixed(2)}`;
  }

  /** Encontrar el valor más alto de la fila para destacarlo */
  function getMaxInRow(row: MatrixRow): number {
    const vals = PARTNER_HEADERS.map((h) => {
      const v = row[h.key as keyof MatrixRow] as number | null;
      return v ?? 0;
    });
    return Math.max(...vals);
  }

  const flatCount = Object.values(filtered).flat().length;

  return (
    <div className={embedded ? "" : "min-h-screen pb-24"} style={{ background: embedded ? "transparent" : "var(--bg-base)" }}>
      {/* Cabecera — solo standalone */}
      {!embedded && (
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="text-[20px] font-bold text-white">Matriz de Costos</h2>
          <div className="flex gap-2">
            <PdfShareButton matrix={rows} />
            <button
              onClick={loadMatrix}
              className="btn-ghost text-sm"
              title="Disponible cuando hay cambios pendientes"
            >
              ↻ Recalcular
            </button>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="relative flex-1 min-w-[160px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="input-field w-auto"
          style={{ appearance: "auto" }}
        >
          {groups.map((g) => (
            <option key={g} value={g} style={{ background: "#0A0F2E", color: "#fff" }}>
              {g === "todas" ? "Todas las categorías" : g}
            </option>
          ))}
        </select>
        <span className="self-center text-xs" style={{ color: "var(--text-muted)" }}>
          {flatCount} servicios
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {/* Scroll indicator */}
        <div className="block sm:hidden px-5 py-1.5 text-[11px] text-center" style={{ color: "var(--text-muted)" }}>
          ← deslizá →
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
            Cargando matriz...
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--accent-green)" }}
                >
                  Servicio
                </th>
                {PARTNER_HEADERS.map((h) => (
                  <th
                    key={h.key}
                    className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--accent-green)" }}
                  >
                    <div>{h.label}</div>
                    <div className="text-[10px] font-normal mt-0.5" style={{ color: "var(--text-muted)" }}>
                      {h.desc}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(filtered).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                    Sin servicios para mostrar
                  </td>
                </tr>
              ) : (
                Object.entries(filtered).map(([group, groupRows]) => (
                  <>
                    {/* Fila de grupo */}
                    <tr key={`g-${group}`} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td
                        colSpan={6}
                        className="px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                        style={{ background: "var(--bg-overlay)", color: "var(--accent-green)" }}
                      >
                        {group}
                      </td>
                    </tr>
                    {/* Filas de servicios */}
                    {groupRows.map((row) => {
                      const maxVal = getMaxInRow(row);
                      return (
                        <tr
                          key={row.id}
                          className="transition-colors"
                          style={{
                            borderBottom: "1px solid var(--border)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-card)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td className="px-4 py-2.5 font-medium text-white text-[13px]">
                            {row.name}
                          </td>
                          {PARTNER_HEADERS.map((h) => {
                            const val = row[h.key as keyof MatrixRow] as number | null;
                            const isMax = val != null && val === maxVal && maxVal > 0;
                            const isZero = val == null || val === 0;
                            const isPending = h.key === "integra_360_plus" && val == null;
                            return (
                              <td
                                key={h.key}
                                className="px-3 py-2.5 text-right tabular-nums text-[13px]"
                                style={{
                                  color: isPending
                                    ? "var(--text-muted)"
                                    : isMax
                                    ? "var(--accent-green)"
                                    : isZero
                                    ? "var(--text-muted)"
                                    : "var(--text-primary)",
                                  fontWeight: isMax ? 600 : 400,
                                }}
                              >
                                {isPending ? "A confirmar" : formatPrice(val)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* FAB — Cargar Servicio (solo standalone) */}
      {!embedded && (
        <a
          href="/matriz/cargar"
          className="fab"
          style={{ bottom: "6rem", right: "1.25rem" }}
          title="Cargar Servicio"
        >
          +
        </a>
      )}
    </div>
  );
}


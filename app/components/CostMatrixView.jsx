"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

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
  { key: "integra_360_plus", label: "Integra 360 Plus", desc: "A confirmar" },
] as const;

export default function CostMatrixView() {
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

  // Grupos únicos para filtro (memoizado)
  const groups = useMemo(
    () => ["todas", ...new Set(rows.map((r) => r.group_name).filter(Boolean))],
    [rows]
  );

  // Filtrado y agrupado (memoizado)
  const filtered = useMemo(() => {
    let result = rows;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter((r) => r.name.toLowerCase().includes(s));
    }

    if (groupFilter !== "todas") {
      result = result.filter((r) => r.group_name === groupFilter);
    }

    // Agrupar por group_name
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

  return (
    <div className="rounded-xl bg-white shadow-sm">
      {/* Cabecera */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
        <h2 className="text-lg font-semibold text-[#1e3c72]">Matriz de Costos</h2>
        <div className="flex gap-2">
          <a
            href="/matriz/cargar"
            className="rounded-lg bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
          >
            + Cargar Servicio
          </a>
          <button
            onClick={loadMatrix}
            className="rounded-lg border px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors"
          >
            ↻ Recalcular
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 border-b px-6 py-3">
        <input
          type="text"
          placeholder="Buscar servicio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[200px] rounded-lg border px-3 py-1.5 text-sm"
        />
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="rounded-lg border px-3 py-1.5 text-sm"
        >
          {groups.map((g) => (
            <option key={g} value={g}>{g === "todas" ? "Todas las categorías" : g}</option>
          ))}
        </select>
        <span className="self-center text-xs text-zinc-400">
          {Object.values(filtered).flat().length} servicios
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="p-8 text-center text-sm text-zinc-400">Cargando matriz...</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-zinc-50">
                <th className="px-4 py-3 text-left font-semibold text-[#1e3c72]">Servicio</th>
                {PARTNER_HEADERS.map((h) => (
                  <th
                    key={h.key}
                    className={`px-3 py-3 text-right font-semibold ${
                      h.key === "integra_360_plus" ? "text-zinc-400" : "text-[#1e3c72]"
                    }`}
                  >
                    <div>{h.label}</div>
                    <div className="text-xs font-normal text-zinc-400">{h.desc}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(filtered).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-400">
                    Sin servicios para mostrar
                  </td>
                </tr>
              ) : (
                Object.entries(filtered).map(([group, groupRows]) => (
                  <>
                    {/* Fila de grupo */}
                    <tr key={`g-${group}`} className="border-b bg-[#1e3c72]/5">
                      <td colSpan={6} className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#1e3c72]">
                        {group}
                      </td>
                    </tr>
                    {/* Filas de servicios */}
                    {groupRows.map((row) => (
                      <tr key={row.id} className="border-b hover:bg-zinc-50 transition-colors">
                        <td className="px-4 py-2.5 font-medium text-zinc-700">{row.name}</td>
                        {PARTNER_HEADERS.map((h) => (
                          <td
                            key={h.key}
                            className={`px-3 py-2.5 text-right tabular-nums ${
                              h.key === "integra_360_plus"
                                ? row.integra_360_plus == null
                                  ? "italic text-zinc-300"
                                  : "text-zinc-400"
                                : h.key === "integra_90"
                                ? "font-semibold text-[#1e3c72]"
                                : "text-zinc-600"
                            }`}
                          >
                            {h.key === "integra_360_plus" && row.integra_360_plus == null
                              ? "A confirmar"
                              : formatPrice(row[h.key as keyof MatrixRow] as number | null)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

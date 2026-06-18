// [FEATURE v0.3.0]: Comparador de servicios + evolución de precios
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import PriceHistoryList from "./PriceHistoryList";
import SectionLabel from "./SectionLabel";

type Service = { id: string; name: string; group_name: string; base_price: number };
type MatrixRow = {
  id: string; name: string; group_name: string;
  activo: number | null; integra_90: number | null;
  integra_180: number | null; integra_360: number | null; integra_360_plus: number | null;
};

const PARTNER_KEYS = [
  { key: "activo" as const, label: "Activo", desc: "60% desc." },
  { key: "integra_90" as const, label: "Integra 90", desc: "Precio base" },
  { key: "integra_180" as const, label: "Integra 180", desc: "30% desc." },
  { key: "integra_360" as const, label: "Integra 360", desc: "40% desc." },
  { key: "integra_360_plus" as const, label: "360 Plus", desc: "A confirmar" },
];

export default function ComparadorTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [showHistory, setShowHistory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/matrix").then((r) => r.json()),
    ]).then(([s, m]) => {
      setServices(s);
      setMatrix(m);
    });
  }, []);

  const filtered = search
    ? services.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) && !selected.includes(s.id))
    : [];

  function toggleService(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
    setSearch("");
  }

  const selectedRows = useMemo(() => {
    return matrix.filter((r) => selected.includes(r.id));
  }, [matrix, selected]);

  return (
    <div className="space-y-5">
      {/* Buscador */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-muted)" }}>
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar servicios para comparar (hasta 4)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
        {search && filtered.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 rounded-xl border z-20 max-h-48 overflow-y-auto"
            style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}>
            {filtered.slice(0, 8).map((s) => (
              <button key={s.id} onClick={() => toggleService(s.id)}
                className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[var(--bg-card-hover)] transition-colors">
                {s.name} <span style={{ color: "var(--text-muted)" }}>({s.group_name})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chips de seleccionados */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((id) => {
            const s = services.find((x) => x.id === id);
            return (
              <button key={id} onClick={() => toggleService(id)}
                className="chip flex items-center gap-1.5">
                {s?.name || id}
                <span style={{ color: "var(--text-muted)" }}>×</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedRows.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Seleccioná hasta 4 servicios para comparar sus precios por plan
          </p>
        </div>
      ) : (
        <>
          {/* Tabla comparativa */}
          <SectionLabel texto="COMPARATIVA DE PRECIOS" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase" style={{ color: "var(--accent-green)" }}>Plan</th>
                  {selectedRows.map((r) => (
                    <th key={r.id} className="px-3 py-2 text-right text-xs font-semibold uppercase" style={{ color: "var(--accent-green)" }}>
                      {r.name.length > 18 ? r.name.slice(0, 18) + "…" : r.name}
                    </th>
                  ))}
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase" style={{ color: "var(--accent-green)" }}>Ahorro máx.</th>
                </tr>
              </thead>
              <tbody>
                {PARTNER_KEYS.map(({ key, label }) => {
                  const vals = selectedRows.map((r) => r[key] ?? 0);
                  const min = Math.min(...vals.filter((v) => v > 0));
                  const max = Math.max(...vals);
                  const ahorro = max - min;
                  return (
                    <tr key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-3 py-2.5 text-xs font-medium text-white">{label}</td>
                      {selectedRows.map((r, i) => {
                        const val = r[key] ?? 0;
                        const isMin = val === min && min > 0 && vals.filter((v) => v > 0).length > 1;
                        return (
                          <td key={r.id} className="px-3 py-2.5 text-right tabular-nums text-xs" style={{ color: val === 0 ? "var(--text-muted)" : "var(--text-primary)" }}>
                            {val === 0 ? "—" : `$${val.toFixed(2)}`}
                            {isMin && (
                              <span className="ml-1 text-[10px] rounded px-1 py-0.5" style={{ background: "var(--accent-green-soft)", color: "var(--accent-green)" }}>
                                ✓ más económico
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-right tabular-nums text-xs font-semibold" style={{ color: ahorro > 0 ? "var(--accent-green)" : "var(--text-muted)" }}>
                        {ahorro > 0 ? `$${ahorro.toFixed(2)}` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Evolución de precios */}
          <SectionLabel texto="EVOLUCIÓN DE PRECIOS" />
          {selectedRows.map((r) => (
            <div key={r.id} className="card">
              <button
                onClick={() => setShowHistory(showHistory === r.id ? null : r.id)}
                className="flex items-center justify-between w-full text-left"
              >
                <span className="text-sm font-semibold text-white">{r.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: showHistory === r.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "var(--text-muted)" }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showHistory === r.id && (
                <div className="mt-3">
                  <PriceHistoryList serviceId={r.id} serviceName={r.name} />
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

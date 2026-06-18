// [FEATURE v0.3.0]: PriceHistoryList — historial de cambios de precio
"use client";

import { useState, useEffect, useCallback } from "react";

type PriceRecord = {
  id: string;
  service_id: string;
  precio_base: number;
  vigente_desde: string;
  vigente_hasta: string | null;
};

interface PriceHistoryListProps {
  serviceId: string;
  serviceName: string;
}

export default function PriceHistoryList({ serviceId, serviceName }: PriceHistoryListProps) {
  const [history, setHistory] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/price-history?service_id=${serviceId}`);
    if (res.ok) setHistory(await res.json());
    setLoading(false);
  }, [serviceId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>Cargando historial...</p>;
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Sin historial de precios para {serviceName}
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          El historial se genera al actualizar precios desde esta versión.
        </p>
      </div>
    );
  }

  // Calcular variación acumulada (primero → último)
  const firstPrice = history[history.length - 1]?.precio_base;
  const lastPrice = history[0]?.precio_base;
  const firstDate = history[history.length - 1]?.vigente_desde;
  const variacionAcum = firstPrice && lastPrice ? ((lastPrice - firstPrice) / firstPrice) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Variación acumulada */}
      {firstPrice && lastPrice && firstDate && variacionAcum !== 0 && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            background: variacionAcum > 0 ? "rgba(255,92,92,0.10)" : "rgba(0,212,122,0.10)",
            border: `1px solid ${variacionAcum > 0 ? "rgba(255,92,92,0.30)" : "rgba(0,212,122,0.30)"}`,
          }}
        >
          <p className="text-white font-medium">
            El precio de <span style={{ color: "var(--accent-green)" }}>{serviceName}</span>{" "}
            {variacionAcum > 0 ? "aumentó" : "se redujo"} un{" "}
            <span style={{ color: variacionAcum > 0 ? "var(--state-error)" : "var(--accent-green)" }}>
              {Math.abs(variacionAcum).toFixed(1)}%
            </span>{" "}
            desde {new Date(firstDate).toLocaleDateString("es-AR")}
          </p>
        </div>
      )}

      {/* Lista cronológica */}
      <div className="space-y-1.5">
        {history.map((h, i) => {
          const prev = history[i + 1];
          const diff = prev ? h.precio_base - prev.precio_base : 0;
          const pct = prev?.precio_base ? ((h.precio_base - prev.precio_base) / prev.precio_base) * 100 : 0;

          return (
            <div
              key={h.id}
              className="flex items-center justify-between rounded-lg px-3 py-2.5"
              style={{ background: "var(--bg-overlay)" }}
            >
              <div>
                <p className="text-[13px] font-medium text-white">
                  ${h.precio_base.toFixed(2)}
                </p>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {new Date(h.vigente_desde).toLocaleDateString("es-AR")}
                  {h.vigente_hasta ? ` → ${new Date(h.vigente_hasta).toLocaleDateString("es-AR")}` : " (vigente)"}
                </p>
              </div>
              {prev && diff !== 0 && (
                <div className="text-right">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: diff > 0 ? "var(--state-error)" : "var(--accent-green)" }}
                  >
                    {diff > 0 ? `↑ +${pct.toFixed(1)}%` : `↓ ${pct.toFixed(1)}%`}
                  </span>
                </div>
              )}
              {!prev && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Precio inicial</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

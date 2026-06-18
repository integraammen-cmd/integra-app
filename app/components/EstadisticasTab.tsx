// [FEATURE v0.3.0]: Estadísticas de uso — tab dentro de Informes
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import KPICard from "./KPICard";
import FilterPanel, { FiltroEstadisticas } from "./FilterPanel";
import StatLineChart from "./StatLineChart";
import CrossTable from "./CrossTable";
import SectionLabel from "./SectionLabel";
import EmptyState from "./EmptyState";

type UsageRecord = {
  id: string;
  socio_codigo: string | null;
  socio_nombre: string;
  tipo_socio: string;
  servicio_nombre: string;
  service_id: string | null;
  monto_cobrado: number;
  fecha_uso: string;
};

const TIPOS_SOCIO = ["Activo", "Integra 90", "Integra 180", "Integra 360", "Integra 360 Plus"];

export default function EstadisticasTab({ grupos }: { grupos: string[] }) {
  const [data, setData] = useState<UsageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltroEstadisticas | null>(null);
  const [viewMode, setViewMode] = useState<"usos" | "monto">("usos");
  const [evolucionView, setEvolucionView] = useState<"usos" | "monto">("usos");
  const [totalSocios, setTotalSocios] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filtros?.desde) params.set("desde", filtros.desde);
    if (filtros?.hasta) params.set("hasta", filtros.hasta);
    if (filtros?.tipo_socio && filtros.tipo_socio !== "Todos") params.set("tipo_socio", filtros.tipo_socio);

    const [dRes, sRes] = await Promise.all([
      fetch(`/api/stats?${params.toString()}`),
      fetch("/api/settings"),
    ]);
    if (dRes.ok) setData(await dRes.json());
    if (sRes.ok) {
      const s = await sRes.json();
      setTotalSocios(parseInt(s.total_socios_padron || "0", 10));
    }
    setLoading(false);
  }, [filtros]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- KPIs ---
  const sociosUnicos = useMemo(() => {
    const set = new Set(data.map((r) => r.socio_codigo || r.socio_nombre));
    return set.size;
  }, [data]);

  const totalUsos = data.length;
  const montoTotal = useMemo(() => data.reduce((sum, r) => sum + (r.monto_cobrado || 0), 0), [data]);
  const promedioUsos = sociosUnicos > 0 ? totalUsos / sociosUnicos : 0;

  // Top 10 servicios
  const topServicios = useMemo(() => {
    const map = new Map<string, { usos: number; monto: number }>();
    data.forEach((r) => {
      const entry = map.get(r.servicio_nombre) || { usos: 0, monto: 0 };
      entry.usos += 1;
      entry.monto += r.monto_cobrado || 0;
      map.set(r.servicio_nombre, entry);
    });
    return [...map.entries()]
      .sort((a, b) => (viewMode === "usos" ? b[1].usos - a[1].usos : b[1].monto - a[1].monto))
      .slice(0, 10);
  }, [data, viewMode]);

  const maxServicioVal = Math.max(...topServicios.map(([, v]) => (viewMode === "usos" ? v.usos : v.monto)), 1);

  // Uso por tipo de socio
  const usoPorTipo = useMemo(() => {
    return TIPOS_SOCIO.map((tipo) => ({
      tipo,
      count: data.filter((r) => r.tipo_socio === tipo).length,
    }));
  }, [data]);

  const maxTipoCount = Math.max(...usoPorTipo.map((t) => t.count), 1);

  // Evolución mensual
  const evolucionMensual = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((r) => {
      const mes = r.fecha_uso.slice(0, 7); // YYYY-MM
      const val = evolucionView === "usos" ? 1 : r.monto_cobrado || 0;
      map.set(mes, (map.get(mes) || 0) + val);
    });
    return [...map.entries()]
      .sort()
      .map(([label, valor]) => ({ label, valor: Math.round(valor * 100) / 100 }));
  }, [data, evolucionView]);

  // Top 5 socios
  const topSocios = useMemo(() => {
    const map = new Map<string, { nombre: string; tipo: string; usos: number; monto: number }>();
    data.forEach((r) => {
      const key = r.socio_codigo || r.socio_nombre;
      const entry = map.get(key) || { nombre: r.socio_nombre, tipo: r.tipo_socio, usos: 0, monto: 0 };
      entry.usos += 1;
      entry.monto += r.monto_cobrado || 0;
      map.set(key, entry);
    });
    return [...map.entries()]
      .sort((a, b) => b[1].usos - a[1].usos)
      .slice(0, 5);
  }, [data]);

  // Matriz cruzada: tipo de socio x top 5 servicios
  const crossData = useMemo(() => {
    const top5 = topServicios.slice(0, 5).map(([n]) => n);
    const result: Record<string, Record<string, number>> = {};
    TIPOS_SOCIO.forEach((tipo) => {
      result[tipo] = {};
      top5.forEach((servicio) => {
        result[tipo][servicio] = data.filter((r) => r.tipo_socio === tipo && r.servicio_nombre === servicio).length;
      });
    });
    return { filas: TIPOS_SOCIO, columnas: top5, datos: result };
  }, [data, topServicios]);

  // Socios inactivos
  const sociosInactivos = totalSocios > 0 ? totalSocios - sociosUnicos : 0;
  const pctInactivos = totalSocios > 0 ? (sociosInactivos / totalSocios) * 100 : 0;

  if (loading) {
    return <p className="text-center py-8 text-sm" style={{ color: "var(--text-muted)" }}>Cargando estadísticas...</p>;
  }

  return (
    <div className="space-y-5">
      <FilterPanel onFilter={setFiltros} grupos={grupos} />

      {data.length === 0 ? (
        <EmptyState
          icono={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>}
          titulo="Sin datos para el período"
          subtitulo="Importá un archivo CSV con registros de uso para ver estadísticas."
        />
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard titulo="Socios únicos" valor={sociosUnicos} subtitulo={`de ${totalSocios || "?"} del padrón`}
              icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
            />
            <KPICard titulo="Total usos" valor={totalUsos}
              icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
            />
            <KPICard titulo="Monto facturado" valor={`$${montoTotal.toLocaleString("es-AR")}`}
              icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>}
            />
            <KPICard titulo="Promedio por socio" valor={promedioUsos.toFixed(1)}
              icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
            />
          </div>

          <SectionLabel texto="SERVICIOS MÁS UTILIZADOS" />
          <div className="card">
            <div className="flex justify-end mb-3">
              <button onClick={() => setViewMode(viewMode === "usos" ? "monto" : "usos")}
                className="text-xs rounded-full px-3 py-1" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}>
                Ver por {viewMode === "usos" ? "monto facturado" : "cantidad de usos"}
              </button>
            </div>
            <div className="space-y-2">
              {topServicios.map(([nombre, val]) => {
                const pct = Math.round(((viewMode === "usos" ? val.usos : val.monto) / maxServicioVal) * 100);
                return (
                  <div key={nombre} className="flex items-center gap-2">
                    <span className="w-28 flex-shrink-0 text-xs truncate" style={{ color: "var(--text-secondary)" }}>{nombre.length > 20 ? nombre.slice(0, 20) + "…" : nombre}</span>
                    <div className="h-3 flex-1 rounded-full" style={{ background: "var(--bg-overlay)" }}>
                      <div className="h-3 rounded-full" style={{ width: `${pct}%`, background: "var(--accent-green)", opacity: 0.3 + (pct / 100) * 0.7 }} />
                    </div>
                    <span className="w-14 text-right text-xs font-semibold text-white">{viewMode === "usos" ? val.usos : `$${val.monto.toFixed(0)}`}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <SectionLabel texto="USO POR TIPO DE SOCIO" />
          <div className="card">
            <div className="flex items-end justify-between gap-1" style={{ height: "120px" }}>
              {usoPorTipo.map(({ tipo, count }) => {
                const h = (count / maxTipoCount) * 100;
                return (
                  <div key={tipo} className="flex flex-1 flex-col items-center justify-end">
                    <span className="mb-1 text-[10px] font-semibold text-white">{count}</span>
                    <div className="w-full max-w-[44px] rounded-t-md" style={{ height: `${h}%`, minHeight: count > 0 ? "4px" : "0", background: "var(--accent-green)", opacity: 0.3 + (h / 100) * 0.7 }} />
                    <span className="mt-1.5 text-[10px] font-medium text-center leading-tight" style={{ color: "var(--text-secondary)" }}>
                      {tipo.replace("Integra ", "I")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <SectionLabel texto="EVOLUCIÓN MENSUAL" />
          <div className="card">
            <div className="flex justify-end mb-3">
              <button onClick={() => setEvolucionView(evolucionView === "usos" ? "monto" : "usos")}
                className="text-xs rounded-full px-3 py-1" style={{ background: "var(--bg-overlay)", color: "var(--text-secondary)" }}>
                {evolucionView === "usos" ? "Monto facturado" : "Cantidad de usos"}
              </button>
            </div>
            <StatLineChart datos={evolucionMensual} />
          </div>

          {totalSocios > 0 && (
            <>
              <SectionLabel texto="COBERTURA DEL PADRÓN" />
              <div className="card" style={{ borderColor: pctInactivos > 50 ? "var(--state-warning)" : "var(--border)" }}>
                <p className="text-sm text-white">
                  <span className="font-bold" style={{ color: pctInactivos > 50 ? "var(--state-warning)" : "var(--accent-green)" }}>
                    {sociosInactivos} socios
                  </span>{" "}
                  de {totalSocios} no registraron uso en el período ({pctInactivos.toFixed(1)}%)
                </p>
              </div>
            </>
          )}

          <SectionLabel texto="TOP 5 SOCIOS" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Socio", "Tipo", "Usos", "Monto"].map((h) => (
                    <th key={h} className="px-2 py-2 text-left font-semibold uppercase" style={{ color: "var(--accent-green)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSocios.map(([key, s], i) => (
                  <tr key={key} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "var(--bg-overlay)" : "transparent" }}>
                    <td className="px-2 py-2 text-white">{s.nombre}</td>
                    <td className="px-2 py-2 text-white">{s.tipo}</td>
                    <td className="px-2 py-2 text-white tabular-nums">{s.usos}</td>
                    <td className="px-2 py-2 text-white tabular-nums">${s.monto.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <SectionLabel texto="USO POR TIPO DE SOCIO × SERVICIO" />
          <CrossTable
            filas={crossData.filas}
            columnas={crossData.columnas}
            datos={crossData.datos}
            destacarMax
          />
        </>
      )}
    </div>
  );
}

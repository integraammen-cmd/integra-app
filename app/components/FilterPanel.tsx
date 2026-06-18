// [FEATURE v0.3.0]: FilterPanel — panel de filtros colapsable para estadísticas
"use client";

import { useState, useEffect } from "react";

export type FiltroEstadisticas = {
  periodo: string;
  desde: string;
  hasta: string;
  tipo_socio: string;
  grupo: string;
};

interface FilterPanelProps {
  onFilter: (filtros: FiltroEstadisticas) => void;
  grupos: string[];
}

const PERIODOS_RAPIDOS = [
  { label: "Este mes", value: "este_mes" },
  { label: "Mes anterior", value: "mes_anterior" },
  { label: "Último trimestre", value: "trimestre" },
  { label: "Este año", value: "este_ano" },
  { label: "Rango custom", value: "custom" },
];

const TIPOS_SOCIO = ["Todos", "Activo", "Integra 90", "Integra 180", "Integra 360", "Integra 360 Plus"];

function getPeriodoFechas(periodo: string): { desde: string; hasta: string } {
  const hoy = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];

  switch (periodo) {
    case "este_mes": {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { desde: fmt(inicio), hasta: fmt(hoy) };
    }
    case "mes_anterior": {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
      const fin = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
      return { desde: fmt(inicio), hasta: fmt(fin) };
    }
    case "trimestre": {
      const inicio = new Date(hoy);
      inicio.setMonth(hoy.getMonth() - 3);
      return { desde: fmt(inicio), hasta: fmt(hoy) };
    }
    case "este_ano": {
      const inicio = new Date(hoy.getFullYear(), 0, 1);
      return { desde: fmt(inicio), hasta: fmt(hoy) };
    }
    default:
      return { desde: "", hasta: "" };
  }
}

export default function FilterPanel({ onFilter, grupos }: FilterPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [periodo, setPeriodo] = useState("este_mes");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [tipoSocio, setTipoSocio] = useState("Todos");
  const [grupo, setGrupo] = useState("todas");

  // Restaurar de localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("integra_filtros_stats");
      if (saved) {
        const f = JSON.parse(saved);
        if (f.periodo) setPeriodo(f.periodo);
        if (f.tipoSocio) setTipoSocio(f.tipoSocio);
        if (f.grupo) setGrupo(f.grupo);
        if (f.desde) setDesde(f.desde);
        if (f.hasta) setHasta(f.hasta);
      }
    } catch { /* ignore */ }
  }, []);

  function aplicar() {
    const fechas = periodo !== "custom" ? getPeriodoFechas(periodo) : { desde, hasta };
    const filtros: FiltroEstadisticas = {
      periodo,
      desde: fechas.desde,
      hasta: fechas.hasta,
      tipo_socio: tipoSocio,
      grupo,
    };
    localStorage.setItem("integra_filtros_stats", JSON.stringify(filtros));
    onFilter(filtros);
  }

  function limpiar() {
    setPeriodo("este_mes");
    setTipoSocio("Todos");
    setGrupo("todas");
    setDesde("");
    setHasta("");
    localStorage.removeItem("integra_filtros_stats");
    onFilter({ periodo: "este_mes", ...getPeriodoFechas("este_mes"), tipo_socio: "Todos", grupo: "todas" });
  }

  return (
    <div className="card space-y-3">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full text-sm font-semibold text-white"
      >
        <span>Filtros</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.2s" }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {!collapsed && (
        <div className="space-y-3 pt-1">
          {/* Período */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Período</label>
            <div className="flex flex-wrap gap-1.5">
              {PERIODOS_RAPIDOS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    background: periodo === p.value ? "var(--accent-green)" : "var(--bg-overlay)",
                    color: periodo === p.value ? "#0A1A0A" : "var(--text-secondary)",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {periodo === "custom" && (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs font-medium text-white/60 mb-1 block">Desde</label>
                <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="input-field" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-medium text-white/60 mb-1 block">Hasta</label>
                <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="input-field" />
              </div>
            </div>
          )}

          {/* Tipo de socio */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Tipo de socio</label>
            <div className="flex flex-wrap gap-1.5">
              {TIPOS_SOCIO.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipoSocio(t)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    background: tipoSocio === t ? "var(--accent-green-soft)" : "var(--bg-overlay)",
                    color: tipoSocio === t ? "var(--accent-green)" : "var(--text-secondary)",
                    border: tipoSocio === t ? "1px solid var(--border-accent)" : "1px solid transparent",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Grupo */}
          <div>
            <label className="text-xs font-medium text-white/60 mb-1.5 block">Grupo de servicio</label>
            <div className="flex flex-wrap gap-1.5">
              {["todas", ...grupos].map((g) => (
                <button
                  key={g}
                  onClick={() => setGrupo(g)}
                  className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                  style={{
                    background: grupo === g ? "var(--accent-green-soft)" : "var(--bg-overlay)",
                    color: grupo === g ? "var(--accent-green)" : "var(--text-secondary)",
                    border: grupo === g ? "1px solid var(--border-accent)" : "1px solid transparent",
                  }}
                >
                  {g === "todas" ? "Todas" : g}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={aplicar} className="btn-primary text-sm flex-1">Aplicar filtros</button>
            <button onClick={limpiar} className="btn-ghost text-sm">Limpiar</button>
          </div>
        </div>
      )}
    </div>
  );
}

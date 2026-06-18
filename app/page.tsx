// [REFACTOR v0.2.0]: Homepage redesign — "Tu Pantallazo Diario" — Integra Mutual brand identity
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import WeeklyAgenda from "./components/WeeklyAgenda";
import KPICard from "./components/KPICard";
import StatBar from "./components/StatBar";
import EmptyState from "./components/EmptyState";
import SectionLabel from "./components/SectionLabel";

type Service = {
  id: string;
  name: string;
  group_id: string;
  group_name: string;
  base_price: number;
};

type Event = {
  id: string;
  title: string;
  start_time: string;
  category: string;
  urgente?: boolean;
};

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

const PARTNER_KEYS = [
  { key: "activo" as const, label: "Activo", desc: "60%" },
  { key: "integra_90" as const, label: "I90", desc: "base" },
  { key: "integra_180" as const, label: "I180", desc: "30%" },
  { key: "integra_360" as const, label: "I360", desc: "40%" },
  { key: "integra_360_plus" as const, label: "I360+", desc: "conf." },
];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [matrix, setMatrix] = useState<MatrixRow[]>([]);

  const today = new Date();
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dateStr = `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;
  const todayStr = today.toISOString().split("T")[0];

  const loadData = useCallback(async () => {
    const [sRes, eRes, mRes] = await Promise.all([
      fetch("/api/services"),
      fetch("/api/events"),
      fetch("/api/matrix"),
    ]);
    if (sRes.ok) setServices(await sRes.json());
    if (eRes.ok) setEvents(await eRes.json());
    if (mRes.ok) setMatrix(await mRes.json());
  }, []);

  useEffect(() => {
    loadData();
    // Refresh every 3 minutes
    const interval = setInterval(loadData, 180000);
    return () => clearInterval(interval);
  }, [loadData]);

  // --- KPI calculations ---
  const totalServices = services.length;
  const servicesWithPrice = services.filter((s) => s.base_price > 0).length;
  const coveragePct = totalServices > 0 ? Math.round((servicesWithPrice / totalServices) * 100) : 0;

  const eventsToday = events.filter((e) => e.start_time.split("T")[0] === todayStr);

  // Urgentes esta semana (próximos 7 días)
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);
  const weekLaterStr = weekLater.toISOString().split("T")[0];
  const urgentThisWeek = events.filter(
    (e) => e.urgente && e.start_time.split("T")[0] >= todayStr && e.start_time.split("T")[0] <= weekLaterStr
  );

  // --- Distribution by group ---
  const groupDistribution = useMemo(() => {
    const groups: Record<string, number> = {};
    matrix.forEach((row) => {
      const g = row.group_name || "Sin grupo";
      groups[g] = (groups[g] || 0) + 1;
    });
    return Object.entries(groups).sort((a, b) => b[1] - a[1]);
  }, [matrix]);

  const maxGroupCount = Math.max(...groupDistribution.map(([, c]) => c), 1);

  // --- Average cost by partner type ---
  const avgByPartner = useMemo(() => {
    const result: Record<string, { total: number; count: number }> = {};
    PARTNER_KEYS.forEach(({ key }) => {
      result[key] = { total: 0, count: 0 };
    });
    matrix.forEach((row) => {
      PARTNER_KEYS.forEach(({ key }) => {
        const val = row[key];
        if (val != null && val > 0) {
          result[key].total += val;
          result[key].count += 1;
        }
      });
    });
    return PARTNER_KEYS.map(({ key, label, desc }) => ({
      key,
      label,
      desc,
      avg: result[key].count > 0 ? result[key].total / result[key].count : 0,
    }));
  }, [matrix]);

  const maxAvg = Math.max(...avgByPartner.map((x) => x.avg), 1);

  // --- Most expensive service ---
  const topService = useMemo(() => {
    let top: MatrixRow | null = null;
    let maxPrice = 0;
    matrix.forEach((row) => {
      if (row.integra_90 != null && row.integra_90 > maxPrice) {
        maxPrice = row.integra_90;
        top = row;
      }
    });
    return top as MatrixRow | null;
  }, [matrix]);

  // --- Recent prices (últimos 3 con precio) ---
  const recentWithPrice = useMemo(() => {
    return services
      .filter((s) => s.base_price > 0)
      .slice(-3)
      .reverse();
  }, [services]);

  // --- Greeting ---
  const hour = today.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex min-h-screen flex-col pb-24 page-container" style={{ background: "var(--bg-base)" }}>
      {/* Header */}
      <header
        className="py-4"
        style={{
          borderBottom: "1px solid var(--border)",
          padding: "16px 16px 8px 16px",
          margin: "0 -16px",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-white leading-tight">
              {greeting}, Coordinador
            </h1>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>
              {dateStr}
            </p>
          </div>
          {/* Logout icon — discreto, SVG línea */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="p-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: "var(--text-secondary)" }}
              title="Cerrar sesión"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 space-y-5 py-4">
        {/* Sección A — KPI Cards (2x2 grid) */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            titulo="Servicios cargados"
            valor={totalServices}
            subtitulo={`${coveragePct}% con precio`}
            icono={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            }
            badge={`${coveragePct}%`}
            borderColor={servicesWithPrice < 20 ? "var(--state-error)" : undefined}
          />
          <KPICard
            titulo="Eventos hoy"
            valor={eventsToday.length}
            icono={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
          />
          <KPICard
            titulo="Urgentes esta semana"
            valor={urgentThisWeek.length}
            icono={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            }
            borderColor={urgentThisWeek.length > 0 ? "var(--border-accent)" : undefined}
          />
          <KPICard
            titulo="Cobertura de precios"
            valor={`${coveragePct}%`}
            subtitulo={`${servicesWithPrice} de ${totalServices}`}
            icono={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            }
          />
        </div>

        {/* Sección B — Estadísticas operativas */}
        <section>
          <SectionLabel texto="RESUMEN OPERATIVO" />

          <div className="space-y-5">
            {/* Stat 1 — Cobertura de precios */}
            <div className="card">
              <h3 className="text-sm font-medium text-white/70 mb-3">
                {servicesWithPrice} de {totalServices} servicios con precio cargado
              </h3>
              <StatBar
                label="Cobertura"
                value={servicesWithPrice}
                max={totalServices}
                suffix={`/ ${totalServices}`}
              />
            </div>

            {/* Stat 2 — Distribución por grupo */}
            <div className="card">
              <h3 className="text-sm font-medium text-white/70 mb-3">
                Distribución por grupo
              </h3>
              <div className="space-y-2">
                {groupDistribution.map(([group, count]) => {
                  const pct = Math.round((count / maxGroupCount) * 100);
                  return (
                    <div key={group} className="flex items-center gap-2">
                      <span
                        className="w-24 flex-shrink-0 text-xs truncate"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {group}
                      </span>
                      <div
                        className="h-3 flex-1 rounded-full"
                        style={{ background: "var(--bg-overlay)" }}
                      >
                        <div
                          className="h-3 rounded-full transition-all"
                          style={{
                            width: `${pct}%`,
                            background: "var(--accent-green)",
                            opacity: 0.3 + (pct / 100) * 0.7,
                          }}
                        />
                      </div>
                      <span className="w-8 text-right text-xs font-semibold text-white">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stat 3 — Costo promedio por tipo de socio */}
            <div className="card">
              <h3 className="text-sm font-medium text-white/70 mb-3">
                Costo promedio por tipo de socio
              </h3>
              <div
                className="flex items-end justify-between gap-1"
                style={{ height: "120px" }}
              >
                {avgByPartner.map(({ key, label, desc, avg }) => {
                  const height = maxAvg > 0 ? (avg / maxAvg) * 100 : 0;
                  return (
                    <div
                      key={key}
                      className="flex flex-1 flex-col items-center justify-end"
                    >
                      <span className="mb-1 text-[10px] font-semibold text-white">
                        ${avg.toFixed(0)}
                      </span>
                      <div
                        className="w-full max-w-[44px] rounded-t-md transition-all"
                        style={{
                          height: `${height}%`,
                          minHeight: avg > 0 ? "4px" : "0",
                          background: "var(--accent-green)",
                          opacity: 0.3 + (height / 100) * 0.7,
                        }}
                      />
                      <span className="mt-1.5 text-[10px] font-medium text-center leading-tight" style={{ color: "var(--text-secondary)" }}>
                        {label}
                      </span>
                      <span className="text-[9px] text-center" style={{ color: "var(--text-muted)" }}>
                        {desc}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stat 4 — Servicio más caro */}
            {topService && (
              <div className="card card-accent">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      background: "var(--accent-green)",
                      color: "#0A1A0A",
                    }}
                  >
                    ★ TOP
                  </span>
                  <span
                    className="text-xs uppercase font-semibold"
                    style={{ color: "var(--accent-green)" }}
                  >
                    Servicio más caro
                  </span>
                </div>
                <p className="text-[15px] font-semibold text-white">
                  {topService.name}
                </p>
                <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>
                  {topService.group_name}
                </p>
                <div className="mt-2 flex gap-4 text-[13px]">
                  <span>
                    <span style={{ color: "var(--text-muted)" }}>I90: </span>
                    <span className="font-semibold" style={{ color: "var(--accent-green)" }}>
                      ${topService.integra_90?.toFixed(2)}
                    </span>
                  </span>
                  <span>
                    <span style={{ color: "var(--text-muted)" }}>Activo: </span>
                    <span className="font-semibold text-white">
                      ${topService.activo?.toFixed(2) ?? "—"}
                    </span>
                  </span>
                </div>
              </div>
            )}

            {/* Stat 5 — Servicios con precio esta semana */}
            {recentWithPrice.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-medium text-white/70 mb-3">
                  Últimos precios cargados
                </h3>
                <div className="space-y-2">
                  {recentWithPrice.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2"
                      style={{ background: "var(--bg-overlay)" }}
                    >
                      <div>
                        <p className="text-[13px] font-medium text-white">
                          {s.name}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          {s.group_name}
                        </p>
                      </div>
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--accent-green)" }}
                      >
                        ${s.base_price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Sección C — Agenda del día */}
        <section>
          <SectionLabel texto="AGENDA DEL DÍA" />
          <WeeklyAgenda />
        </section>
      </main>
    </div>
  );
}



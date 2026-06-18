// [FIX v0.2.3]: Inicio simplificado — KPI cards + agenda del día, sin stats operativas
"use client";

import { useEffect, useState, useCallback } from "react";
import KPICard from "./components/KPICard";

// [FIX v0.2.3]: timezone fix — convertir UTC a Argentina (UTC-3)
const toArgentinaDate = (timestamp: string) => {
  const date = new Date(timestamp);
  const argDate = new Date(date.getTime() - 3 * 60 * 60 * 1000);
  return argDate.toISOString().split("T")[0];
};

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

function getWeekDays() {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }

function fmtDayShort(d: Date) {
  const wd = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  return `${wd[d.getDay()]} ${d.getDate()}`;
}

function fmtTime24(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

const WEEKDAY_NAMES = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(fmtDate(new Date()));

  const today = new Date();
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dateStr = `${days[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;
  const todayStr = fmtDate(today);
  const weekDays = getWeekDays();

  const loadData = useCallback(async () => {
    const [sRes, eRes] = await Promise.all([
      fetch("/api/services"),
      fetch("/api/events"),
    ]);
    if (sRes.ok) setServices(await sRes.json());
    if (eRes.ok) setEvents(await eRes.json());
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 180000);
    return () => clearInterval(interval);
  }, [loadData]);

  // KPI calculations
  const totalServices = services.length;
  const servicesWithPrice = services.filter((s) => s.base_price > 0).length;
  const coveragePct = totalServices > 0 ? Math.round((servicesWithPrice / totalServices) * 100) : 0;

  // [FIX v0.2.3]: timezone-aware event filtering
  const weekLater = new Date(today);
  weekLater.setDate(today.getDate() + 7);
  const weekLaterStr = fmtDate(weekLater);
  const urgentThisWeek = events.filter(
    (e) => e.urgente && toArgentinaDate(e.start_time) >= todayStr && toArgentinaDate(e.start_time) <= weekLaterStr
  );

  const eventsToday = events.filter((e) => toArgentinaDate(e.start_time) === todayStr);

  // Day events (timezone-aware)
  const dayEvents = events
    .filter((e) => toArgentinaDate(e.start_time) === selectedDay)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  const hour = today.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex min-h-screen flex-col pb-24 page-container" style={{ background: "var(--bg-base)" }}>
      <header style={{ borderBottom: "1px solid var(--border)", padding: "16px 16px 8px 16px", margin: "0 -16px" }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-white leading-tight">{greeting}, Coordinador</h1>
            <p className="mt-0.5 text-[13px]" style={{ color: "var(--text-secondary)" }}>{dateStr}</p>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="p-1 rounded-lg transition-opacity hover:opacity-70" style={{ color: "var(--text-secondary)" }} title="Cerrar sesión">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 space-y-5 py-4">
        {/* KPI Cards 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard titulo="Servicios cargados" valor={totalServices} subtitulo={`${coveragePct}% con precio`}
            icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>}
            badge={`${coveragePct}%`} borderColor={servicesWithPrice < 20 ? "var(--state-error)" : undefined}
          />
          <KPICard titulo="Eventos hoy" valor={eventsToday.length}
            icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          />
          <KPICard titulo="Urgentes esta semana" valor={urgentThisWeek.length}
            icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>}
            borderColor={urgentThisWeek.length > 0 ? "var(--border-accent)" : undefined}
          />
          <KPICard titulo="Cobertura de precios" valor={`${coveragePct}%`} subtitulo={`${servicesWithPrice} de ${totalServices}`}
            icono={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
          />
        </div>

        {/* Day selector */}
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {weekDays.map((d) => {
            const ds = fmtDate(d);
            const isToday = ds === todayStr;
            const isSelected = ds === selectedDay;
            return (
              <button key={ds} onClick={() => setSelectedDay(ds)}
                className="flex-shrink-0 rounded-xl px-4 py-2.5 text-xs font-medium transition-all"
                style={{
                  background: isSelected ? "var(--accent-green)" : isToday ? "var(--bg-card-hover)" : "var(--bg-card)",
                  color: isSelected ? "#0A1A0A" : isToday ? "#fff" : "var(--text-secondary)",
                  border: isToday && !isSelected ? "1px solid var(--accent-green)" : "1px solid transparent",
                }}
              >
                <div className="text-[10px]">{WEEKDAY_NAMES[d.getDay()]}</div>
                <div className="text-lg font-semibold">{d.getDate()}</div>
              </button>
            );
          })}
        </div>

        {/* Day events list */}
        <section>
          <h2 className="section-label mb-3">AGENDA DEL DÍA</h2>
          {dayEvents.length > 0 ? (
            <div className="space-y-2">
              {dayEvents.map((e) => {
                const isUrgent = e.urgente || e.category === "urgente";
                return (
                  <div key={e.id} className="card flex items-center gap-3 py-3"
                    style={{ borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}` }}
                  >
                    <span className="text-[13px] font-medium min-w-[3.5rem] tabular-nums" style={{ color: "var(--accent-green)" }}>
                      {fmtTime24(e.start_time)}
                    </span>
                    <span className="text-[13px] text-white flex-1 font-medium">{e.title}</span>
                    {isUrgent && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                        style={{ background: "rgba(255,92,92,0.20)", color: "var(--state-error)" }}>Urgente</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--text-muted)", opacity: 0.3 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>Sin eventos para este día</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
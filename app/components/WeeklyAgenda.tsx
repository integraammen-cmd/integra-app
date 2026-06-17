// [REFACTOR v0.2.0]: WeeklyAgenda redesign — Integra Mutual brand identity
"use client";

import { useState, useEffect, useCallback } from "react";
import EmptyState from "./EmptyState";

type Event = {
  id: string;
  title: string;
  start_time: string;
  category: string;
  alarm_enabled: boolean;
  urgente?: boolean;
};

function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }

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

/** Formato 24hs: HH:MM */
function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function WeeklyAgenda({ embedded }: { embedded?: boolean }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(fmtDate(new Date()));
  const weekDays = getWeekDays();

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const dayEvents = events.filter((e) => fmtDate(new Date(e.start_time)) === selectedDay);

  const weekDayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  return (
    <>
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto py-1 mb-3">
        {weekDays.map((d) => {
          const ds = fmtDate(d);
          const isToday = ds === fmtDate(new Date());
          const isSelected = ds === selectedDay;

          return (
            <button
              key={ds}
              onClick={() => setSelectedDay(ds)}
              className="flex-shrink-0 rounded-xl px-4 py-2.5 text-xs font-medium transition-all"
              style={{
                background: isSelected
                  ? "var(--accent-green)"
                  : isToday
                  ? "var(--bg-card-hover)"
                  : "var(--bg-card)",
                color: isSelected ? "#0A1A0A" : isToday ? "#fff" : "var(--text-secondary)",
                border: isToday && !isSelected
                  ? "1px solid var(--accent-green)"
                  : "1px solid transparent",
              }}
            >
              <div className="text-[10px]">{weekDayNames[d.getDay()]}</div>
              <div className="text-lg font-semibold">{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      {/* Agenda */}
      <section>
        {dayEvents.length > 0 ? (
          <div className="space-y-2">
            {dayEvents.map((e) => {
              const isUrgent = e.urgente || e.category === "urgente";
              return (
                <div
                  key={e.id}
                  className="card flex items-center gap-3 py-3"
                  style={{
                    borderLeft: `3px solid ${isUrgent ? "var(--state-error)" : "var(--accent-green)"}`,
                  }}
                >
                  <span
                    className="text-[13px] font-medium min-w-[3.5rem] tabular-nums"
                    style={{ color: "var(--accent-green)" }}
                  >
                    {fmtTime(e.start_time)}
                  </span>
                  <span className="text-[13px] text-white flex-1 font-medium">
                    {e.title}
                  </span>
                  {isUrgent && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        background: "rgba(255,92,92,0.20)",
                        color: "var(--state-error)",
                      }}
                    >
                      Urgente
                    </span>
                  )}
                  {e.alarm_enabled && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icono={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            titulo="Sin eventos para hoy"
            subtitulo="Usá el calendario para crear nuevos eventos"
          />
        )}
      </section>
    </>
  );
}


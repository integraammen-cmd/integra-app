"use client";

import { useState, useEffect, useCallback } from "react";

type Event = {
  id: string;
  title: string;
  start_time: string;
  category: string;
  alarm_enabled: boolean;
};

const CATEGORY_BADGE: Record<string, string> = {
  salud: "bg-emerald-900/50 text-emerald-300",
  sociales: "bg-blue-900/50 text-blue-300",
  gremial: "bg-purple-900/50 text-purple-300",
  admin: "bg-zinc-700 text-zinc-300",
  urgente: "bg-red-900/50 text-red-300",
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

export default function WeeklyAgenda() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>(fmtDate(new Date()));
  const weekDays = getWeekDays();

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const dayEvents = events.filter((e) => fmtDate(new Date(e.start_time)) === selectedDay);

  return (
    <>
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto py-1">
        {weekDays.map((d) => {
          const ds = fmtDate(d);
          const today = fmtDate(new Date());
          const isToday = ds === today;
          const isSelected = ds === selectedDay;

          return (
            <button
              key={ds}
              onClick={() => setSelectedDay(ds)}
              className={`flex-shrink-0 rounded-xl px-4 py-2.5 text-xs font-medium transition-colors ${
                isSelected
                  ? "bg-[#1e3c72] text-white"
                  : isToday
                  ? "bg-zinc-700 text-white border border-[#1e3c72]"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              <div>{d.toLocaleDateString("es-AR", { weekday: "short" })}</div>
              <div className="text-lg">{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      {/* Agenda */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-zinc-300 uppercase tracking-wider">
          📅 AGENDA DEL DÍA
        </h2>
        {dayEvents.length > 0 ? (
          <div className="space-y-1.5">
            {dayEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-3">
                <span className="text-sm font-mono text-[#1e3c72] min-w-[4rem]">
                  {new Date(e.start_time).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_BADGE[e.category] || "bg-zinc-700 text-zinc-300"}`}>
                  {e.category}
                </span>
                <span className="text-sm text-zinc-200 flex-1">{e.title}</span>
                {e.alarm_enabled && <span>🔔</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 px-1">Sin eventos para este día</p>
        )}
      </section>
    </>
  );
}

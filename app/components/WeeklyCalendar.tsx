"use client";

import { useEffect, useState, useCallback } from "react";

type Event = {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  category: "salud" | "sociales" | "gremial" | "admin" | "urgente";
  alarm_enabled: boolean;
};

const CATEGORY_BG: Record<string, string> = {
  salud: "bg-emerald-900/70 text-emerald-200 border-emerald-700",
  sociales: "bg-blue-900/70 text-blue-200 border-blue-700",
  gremial: "bg-purple-900/70 text-purple-200 border-purple-700",
  admin: "bg-zinc-700 text-zinc-200 border-zinc-600",
  urgente: "bg-red-900/70 text-red-200 border-red-700",
};

function getWeekDays() {
  const now = new Date();
  const day = now.getDay(); // 0=dom
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function fmtDate(d: Date) { return d.toISOString().split("T")[0]; }

// Formato tipo "lun 15", "mar 16"
function fmtDayShort(d: Date) {
  const weekdays = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  return `${weekdays[d.getDay()]} ${d.getDate()}`;
}

export default function WeeklyCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", start_time: "", category: "admin" as Event["category"], alarm_enabled: false });
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(fmtDate(new Date()));
  const weekDays = getWeekDays();
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 a 18

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const dayEvents = events.filter((e) => fmtDate(new Date(e.start_time)) === selectedDay);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError((await res.json()).error); return; }
    setShowForm(false);
    setForm({ title: "", start_time: "", category: "admin", alarm_enabled: false });
    loadEvents();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    loadEvents();
  }

  function eventAt(day: Date, hour: number): Event[] {
    const dayStr = fmtDate(day);
    return events.filter((e) => {
      const d = new Date(e.start_time);
      return fmtDate(d) === dayStr && d.getHours() === hour;
    });
  }

  const selectedDayDate = new Date(selectedDay + "T00:00:00");

  return (
    <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 overflow-hidden">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">
          Semana del {fmtDayShort(weekDays[0])} al {fmtDayShort(weekDays[6])}
        </h2>
        <span className="text-xs text-zinc-500">{new Date().toLocaleDateString("es-AR", { year: "numeric" })}</span>
      </div>

      {/* Selector de días — botones estilo original: lun15, mar16, etc. */}
      <div className="flex gap-1 overflow-x-auto px-3 py-2 border-b border-zinc-700">
        {weekDays.map((d) => {
          const ds = fmtDate(d);
          const isToday = ds === fmtDate(new Date());
          const isSelected = ds === selectedDay;
          return (
            <button
              key={ds}
              onClick={() => setSelectedDay(ds)}
              className={`flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold transition-colors min-w-[56px] text-center ${
                isSelected
                  ? "bg-[#1e3c72] text-white shadow-md"
                  : isToday
                  ? "bg-zinc-700 text-white border border-[#1e3c72]"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {fmtDayShort(d)}
            </button>
          );
        })}
      </div>

      {/* Grilla del día seleccionado (solo se muestra ese día) */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="w-14 py-2 text-xs text-zinc-500">Hora</th>
              <th className="py-2 text-xs font-medium text-[#2ecc71]">
                {fmtDayShort(selectedDayDate)}
              </th>
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => {
              const evts = eventAt(selectedDayDate, h);
              return (
                <tr key={h} className="border-b border-zinc-800">
                  <td className="py-3 pr-2 text-right text-xs text-zinc-500 align-top">{h}:00</td>
                  <td className="py-1 px-1 align-top">
                    {evts.length === 0 ? (
                      <div className="py-2 text-xs text-zinc-600 italic">—</div>
                    ) : (
                      evts.map((ev) => (
                        <div
                          key={ev.id}
                          className={`mb-1 rounded border px-2 py-1.5 text-xs cursor-pointer group relative ${CATEGORY_BG[ev.category]}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{ev.title}</span>
                            {ev.alarm_enabled && <span className="text-[10px]">🔔</span>}
                          </div>
                          <button
                            onClick={() => handleDelete(ev.id)}
                            className="absolute top-0 right-0 -mt-1.5 -mr-1.5 rounded-full bg-red-600 w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Lista compacta de eventos del día */}
      {dayEvents.length > 0 && (
        <div className="px-4 py-3 border-t border-zinc-700 space-y-1.5">
          <h3 className="text-xs font-semibold text-zinc-500 mb-2">
            {dayEvents.length} evento{dayEvents.length > 1 ? "s" : ""} el {fmtDayShort(selectedDayDate)}
          </h3>
          {dayEvents.map((ev) => (
            <div key={ev.id} className="flex items-center gap-2 text-xs">
              <span className="text-zinc-500 w-12">
                {new Date(ev.start_time).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${CATEGORY_BG[ev.category]}`}>
                {ev.category}
              </span>
              <span className="text-zinc-200">{ev.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* Floating add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="fixed bottom-24 right-6 z-40 rounded-full bg-[#2ecc71] w-14 h-14 text-white text-2xl shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center"
      >
        +
      </button>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-sm rounded-xl bg-zinc-800 p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nuevo Evento</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Título"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 outline-none"
                required
              />
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white outline-none"
                required
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as Event["category"] })}
                className="w-full rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white outline-none"
              >
                <option value="admin">Admin</option>
                <option value="salud">Salud</option>
                <option value="sociales">Sociales</option>
                <option value="gremial">Gremial</option>
                <option value="urgente">Urgente</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.alarm_enabled}
                  onChange={(e) => setForm({ ...form, alarm_enabled: e.target.checked })}
                  className="rounded"
                />
                Activar alarma
              </label>
              {error && <p className="text-xs text-red-400">{error}</p>}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#2ecc71] px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

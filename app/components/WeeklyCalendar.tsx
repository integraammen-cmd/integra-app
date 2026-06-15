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

const CATEGORY_LABELS: Record<string, string> = {
  salud: "Salud", sociales: "Sociales", gremial: "Gremial", admin: "Admin", urgente: "Urgente",
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
function fmtDay(d: Date) {
  return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
}

export default function WeeklyCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", start_time: "", category: "admin" as Event["category"], alarm_enabled: false });
  const [error, setError] = useState<string | null>(null);
  const weekDays = getWeekDays();
  const hours = Array.from({ length: 11 }, (_, i) => i + 8); // 8 a 18

  const loadEvents = useCallback(async () => {
    const res = await fetch("/api/events");
    if (res.ok) setEvents(await res.json());
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

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

  return (
    <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">
          {fmtDay(weekDays[0])} — {fmtDay(weekDays[6])}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="w-12 py-2 text-xs text-zinc-500">Hora</th>
              {weekDays.map((d) => (
                <th key={d.toISOString()} className="py-2 text-xs font-medium text-zinc-300">
                  {fmtDay(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((h) => (
              <tr key={h} className="border-b border-zinc-800">
                <td className="py-3 pr-2 text-right text-xs text-zinc-500 align-top">{h}:00</td>
                {weekDays.map((day) => {
                  const evts = eventAt(day, h);
                  return (
                    <td key={day.toISOString() + h} className="py-1 px-1 align-top">
                      {evts.map((e) => (
                        <div key={e.id} className={`mb-1 rounded border px-2 py-1 text-xs cursor-pointer group relative ${CATEGORY_BG[e.category]}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium truncate">{e.title}</span>
                            {e.alarm_enabled && <span>🔔</span>}
                          </div>
                          <button onClick={() => handleDelete(e.id)} className="absolute top-0 right-0 -mt-1 -mr-1 rounded-full bg-red-600 w-4 h-4 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">×</button>
                        </div>
                      ))}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="fixed bottom-24 right-6 z-40 rounded-full bg-[#2ecc71] w-14 h-14 text-white text-2xl shadow-lg hover:bg-emerald-600 transition-colors flex items-center justify-center"
      >
        +
      </button>

      {/* Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleCreate} className="w-full max-w-sm rounded-xl bg-zinc-800 p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nuevo Evento</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400" required />
              <input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white" required />
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Event["category"] })}
                className="w-full rounded-lg border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white">
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" checked={form.alarm_enabled} onChange={(e) => setForm({ ...form, alarm_enabled: e.target.checked })} /> Activar alarma
              </label>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="submit" className="flex-1 rounded-lg bg-[#2ecc71] py-2 text-sm font-medium text-white hover:bg-emerald-600">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-lg border border-zinc-600 py-2 text-sm text-zinc-300 hover:bg-zinc-700">Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
